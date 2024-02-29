// import * as fs from "fs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";
import { PNG } from "pngjs";

export function changeImageSize(
  width: number,
  height: number,
  run_mode: string
): [number, number] {
  // 最小的宽高为本机896，runpod1024
  const limited = run_mode === "LOCAL" ? 896 : 1024;
  const minSize = Math.min(width, height);

  // 缩放宽高，使得最窄的边等于limited
  let scale: number;
  let widthScale: number;
  let heightScale: number;
  if (minSize > limited) {
    scale = minSize / limited;
    widthScale = Math.floor(width / scale);
    heightScale = Math.floor(height / scale);
  } else {
    scale = limited / minSize;
    widthScale = Math.floor(width * scale);
    heightScale = Math.floor(height * scale);
  }

  // 将两个值都除以64，然后取整,也就是说边长必须是64的倍数
  widthScale = Math.floor(widthScale / 64) * 64;
  heightScale = Math.floor(heightScale / 64) * 64;

  return [widthScale, heightScale];
}

export async function queuePrompt(
  prompt: Object,
  clientId: string,
  serverAddress: string
): Promise<any> {
  while (true) {
    try {
      const p = { prompt: prompt, client_id: clientId };
      const data = JSON.stringify(p);
      const response = await axios.post(
        `http://${serverAddress}/prompt`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      return response.data;
    } catch (error) {
      console.log("连接超时，正在重试:", error);
    }
  }
}

async function getHistory(
  promptId: string,
  serverAddress: string
): Promise<any> {
  const response = await axios.get(
    `http://${serverAddress}/history/${promptId}`
  );
  return response.data;
}

export async function getImage(
  filename: string,
  subfolder: string,
  folderType: string,
  serverAddress: string
): Promise<any> {
  const data = { filename, subfolder, type: folderType };
  const urlValues = new URLSearchParams(data).toString();
  const response = await axios.get(
    `http://${serverAddress}/view?${urlValues}`,
    {
      responseType: "arraybuffer",
    }
  );
  return response.data;
}

export function handleWhitespace(string: string): string {
  return string
    .trim()
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\t/g, " ");
}

export function parseName(ckptName: string): string {
  const path = ckptName;
  const filename = path.split("/").pop() || "";
  const filenameWithoutExtension = filename.split(".").slice(0, -1);
  return filenameWithoutExtension.join(".");
}

export async function uploadImage(
  host: string,
  imageData: File
): Promise<string> {
  const fileName = imageData.name;

  const url = `http://${host}/upload/image`;

  // 使用 FileReader API 读取 File 对象的内容
  const reader = new FileReader();
  const promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const binaryString = reader.result as string;
      const binaryData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        binaryData[i] = binaryString.charCodeAt(i);
      }

      const formData = new FormData();
      formData.append("overwrite", "true");
      formData.append("subfolder", "");
      const blob = new Blob([binaryData]);
      formData.append("image", blob, fileName);

      // 使用 axios 发送请求
      axios
        .post(url, formData, {
          headers: {
            Accept: "application/json",
          },
        })
        .then((response) => {
          if (response.status !== 200) {
            reject("");
          } else {
            resolve(response.data.name);
          }
        })
        .catch(reject);
    };
    reader.onerror = reject;
  });
  reader.readAsBinaryString(imageData);

  return promise;
}

export async function getImages(
  ws: WebSocket,
  prompt: any,
  clientId: string,
  serverAddress: string
): Promise<any> {
  const promptId = (await queuePrompt(prompt, clientId, serverAddress))
    .prompt_id;
  const outputImages: any = {};

  while (true) {
    const out = await new Promise((resolve) => {
      ws.once("message", (data) => {
        resolve(data);
      });
    });

    if (typeof out === "string") {
      const message = JSON.parse(out);
      if (message.type === "executing") {
        const data = message.data;
        if (data.node === null && data.prompt_id === promptId) {
          break; // Execution is done
        }
      }
    } else {
      continue; // Previews are binary data
    }
  }

  const history = (await getHistory(promptId, serverAddress))[promptId];
  for (const o in history.outputs) {
    for (const nodeId in history.outputs) {
      const nodeOutput = history.outputs[nodeId];
      if ("images" in nodeOutput) {
        const imagesOutput: any[] = [];
        for (const image of nodeOutput.images) {
          const imageData = await getImage(
            image.filename,
            image.subfolder,
            image.type,
            serverAddress
          );
          imagesOutput.push(imageData);
        }
        outputImages[nodeId] = imagesOutput;
      }
    }
  }

  return outputImages;
}
