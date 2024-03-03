// import * as fs from "fs";
import axios from "axios";
import { workerData } from "worker_threads";

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
  clientId: string
): Promise<any> {
  const url = `http://${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/prompt`;

  const data = {
    prompt: prompt,
    client_id: clientId,
  };
  while (true) {
    try {
      const response = await axios.post(url, data, {
        timeout: 5000,
      });

      return response.data.prompt_id;
    } catch (error) {
      throw error;
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

export async function getQueueTaskNumber(
  serverAddress: string
): Promise<number> {
  const response = await axios.get(`http://${serverAddress}/queue`);
  const taskNumber =
    response.data.queue_running.length + response.data.queue_pending.length - 1;
  return taskNumber;
}

export async function getImages(
  ws: WebSocket,
  prompt: any,
  clientId: string,
  serverAddress: string,
  setStatus: (status: string) => void,
  setDisableButton: (disable: boolean) => void
): Promise<any> {
  const promptId = await queuePrompt(prompt, clientId);
  console.log("当前promptId", promptId);
  const outputImages: any = {};

  let completed = false;

  ws.onmessage = async (event) => {
    console.log("ws.onmessage", event.data);
    if (typeof event.data === "string") {
      const message = JSON.parse(event.data);
      const data = message.data;

      if (message.type === "execution_start") {
        setStatus("任务已加入队列中.");
      }

      if (message.type === "execution_cached") {
        setStatus("已经开始生成图片，请稍等...");
      }

      if (message.type === "execution_error") {
        const { exception_message, exception_type } = data;
        setStatus(
          `任务执行出错。|错误类型为: ${exception_type}|错误信息为: ${exception_message}`
        );
        setDisableButton(false);
        ws.onmessage = null;
      }
      if (message.type === "progress") {
        const { value, max, node } = data;
        const nodeInfo = prompt[data.node]._meta.title;
        setStatus(`正在执行第 ${node} 号节点:|${nodeInfo}|${value}/${max}`);
      }

      if (message.type === "status") {
        const queue_remaining = data.status.exec_info.queue_remaining;
        setStatus(`还有 ${queue_remaining} 个任务在队列中`);
      }

      if (message.type === "executing") {
        if (data.node === null && data.prompt_id === promptId) {
          completed = true; // Execution is done
        } else if (data.prompt_id === promptId) {
          const nodeInfo = prompt[data.node]._meta.title;
          setStatus(`开始执行第 ${data.node} 号节点|${nodeInfo}`);
        }
      }
    }
  };

  while (!completed) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 在任务完结之前维持在这里不往下执行
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
