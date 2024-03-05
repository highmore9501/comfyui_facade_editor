import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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

export async function getResults(
  prompt: any,
  setStatus: (status: string) => void,
  setDisableButton: (disable: boolean) => void
): Promise<any> {
  const clientId = uuidv4();
  const server_address = process.env.NEXT_PUBLIC_SERVER_ADDRESS as string;
  const ws = new WebSocket(`ws://${server_address}/ws?clientId=${clientId}`);
  const promptId = await queuePrompt(prompt, clientId);

  ws.onerror = (event) => {
    console.log("ws.onerror", event);
    setStatus("连接服务器失败");
  };

  const outputResults: any = {};

  let completed = false;
  let suceess = false;

  ws.onmessage = async (event) => {
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
        completed = true;
        ws.onmessage = null;
      }
      if (message.type === "progress") {
        const { value, max, node } = data;
        const nodeInfo = prompt[data.node]._meta.title;
        setStatus(`正在执行第 ${node} 号节点:|${nodeInfo}|${value}/${max}`);
      }

      if (message.type === "status") {
        const queue_remaining = data.status.exec_info.queue_remaining;
        if (queue_remaining == 0) {
          setStatus("图片已经生成，正在下载中");
        } else {
          setStatus(`还有 ${queue_remaining - 1} 个任务在队列中`);
        }
      }

      if (message.type === "executing") {
        if (data.node === null && data.prompt_id === promptId) {
          completed = true; // Execution is done
          suceess = true;
        } else if (data.prompt_id === promptId) {
          const nodeInfo = prompt[data.node]._meta.title;
          setStatus(`开始执行第 ${data.node} 号节点|${nodeInfo}`);
        }
      }

      if (message.type === "execution_interrupted") {
        setStatus("任务被中断");
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
      setStatus("没有生成图片，请检查工作流是否有输出节点");
    }
  }

  return outputResults;
}
