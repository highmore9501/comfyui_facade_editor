import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { IntlShape } from "react-intl";

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
            "Content-Type": "multipart/form-data",
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

export async function uploadMask(
  host: string,
  imageData: Blob,
  refImage: string
): Promise<string> {
  const refImageName = refImage.split(".")[0];
  const fileName = `mask_${refImageName}.png`;
  const url = `http://${host}/upload/mask`;

  const promise = new Promise<string>((resolve, reject) => {
    const original_ref = {
      filename: refImage,
      type: "input",
    };
    // 把imageData转化成png格式
    const blob = new Blob([imageData], { type: "image/png" });

    const formData = new FormData();
    formData.append("image", blob, fileName);
    formData.append("original_ref", JSON.stringify(original_ref));
    formData.append("type", "input");
    formData.append("subfolder", "clipspace");
    formData.append("overwrite", "true");

    axios
      .post(url, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status !== 200) {
          reject("");
        } else {
          const name = response.data.name;
          const subfolder = response.data.subfolder;
          resolve(`${subfolder}/${name}`);
        }
      })
      .catch(reject);
  });

  return promise;
}

export async function getResults(
  prompt: any,
  intl: IntlShape,
  setStatus: (status: string) => void,
  setDisableButton: (disable: boolean) => void
): Promise<any> {
  const clientId = uuidv4();
  const server_address = process.env.NEXT_PUBLIC_SERVER_ADDRESS as string;
  const ws = new WebSocket(`ws://${server_address}/ws?clientId=${clientId}`);
  const promptId = await queuePrompt(prompt, clientId);

  ws.onerror = (event) => {
    console.log("ws.onerror", event);
    setStatus(
      intl.formatMessage({
        id: "utils.comfyui.failedToConnetWS",
      })
    );
  };

  const outputResults: any = {};

  let completed = false;
  let suceess = false;

  ws.onmessage = async (event) => {
    if (typeof event.data === "string") {
      const message = JSON.parse(event.data);
      const data = message.data;

      if (message.type === "execution_start") {
        setStatus(
          intl.formatMessage({
            id: "utils.comfyui.taskAdded",
          })
        );
      }

      if (message.type === "execution_cached") {
        setStatus(
          intl.formatMessage({
            id: "utils.comfyui.waitForResult",
          })
        );
      }

      if (message.type === "execution_error") {
        const { exception_message, exception_type } = data;
        setStatus(
          intl.formatMessage(
            {
              id: "utils.comfyui.executionError",
            },
            {
              exception_type: exception_type,
              exception_message: exception_message,
            }
          )
        );
        setDisableButton(false);
        completed = true;
        ws.onmessage = null;
      }
      if (message.type === "progress") {
        const { value, max, node } = data;
        const nodeInfo = prompt[data.node]._meta.title;
        setStatus(
          intl.formatMessage(
            {
              id: "utils.comfyui.progress",
            },
            {
              node: node,
              nodeInfo: nodeInfo,
              value: value,
              max: max,
            }
          )
        );
      }

      if (message.type === "status") {
        const queue_remaining = data.status.exec_info.queue_remaining;
        if (queue_remaining == 0) {
          setStatus(
            intl.formatMessage({
              id: "utils.comfyui.downloading",
            })
          );
        } else {
          const remaining = queue_remaining - 1;
          setStatus(
            intl.formatMessage(
              {
                id: "utils.comfyui.tasksRemain",
              },
              {
                remaining: remaining,
              }
            )
          );
        }
      }

      if (message.type === "executing") {
        if (data.node === null && data.prompt_id === promptId) {
          completed = true; // Execution is done
          suceess = true;
        } else if (data.prompt_id === promptId) {
          const nodeInfo = prompt[data.node].class_type;
          setStatus(
            intl.formatMessage(
              {
                id: "utils.comfyui.executing",
              },
              {
                datanode: data.node,
                nodeInfo: nodeInfo,
              }
            )
          );
        }
      }

      if (message.type === "execution_interrupted") {
        setStatus(
          intl.formatMessage({
            id: "utils.comfyui.executionInterrupted",
          })
        );
        setDisableButton(false);
        completed = true;
        ws.onmessage = null;
      }
    }
  };

  while (!completed) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 在任务完结之前维持在这里不往下执行
  }

  ws.close();

  if (suceess) {
    const history = (await getHistory(promptId, server_address))[promptId];
    console.log("history", history);
    for (const nodeId in history.outputs) {
      const nodeOutput = history.outputs[nodeId];
      if ("images" in nodeOutput) {
        const imagesOutput: any[] = [];
        for (const image of nodeOutput.images) {
          const imageFormat = image.format;
          const imageData = await getImage(
            image.filename,
            image.subfolder,
            image.type,
            server_address
          );
          const blob = new Blob([imageData], { type: imageFormat });
          imagesOutput.push(blob);
        }
        outputResults[nodeId] = imagesOutput;
      } else if ("gifs" in nodeOutput) {
        const gifsOutput: any[] = [];
        for (const gif of nodeOutput.gifs) {
          const gifFormat = gif.format;
          const gifData = await getImage(
            gif.filename,
            gif.subfolder,
            gif.type,
            server_address
          );
          const blob = new Blob([gifData], { type: gifFormat });
          gifsOutput.push(blob);
        }
        outputResults[nodeId] = gifsOutput;
      }
    }

    if (outputResults.length === 0) {
      setStatus(
        intl.formatMessage({
          id: "utils.comfyui.noResult",
        })
      );
    }
  }

  return outputResults;
}
