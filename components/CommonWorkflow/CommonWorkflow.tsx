"use client";

import React from "react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import ReactPlayer from "react-player";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader/FileUploader";
import { getResults } from "@/utils/comfyui";
import { v4 as uuidv4 } from "uuid";

// 生产环境下这个值从服务器查询获得
// import workflowSetting from "@/public/workflows/current_setting.json";

const clientId = uuidv4();
const server_address = process.env.NEXT_PUBLIC_SERVER_ADDRESS as string;
const ws = new WebSocket(`ws://${server_address}/ws?clientId=${clientId}`);

export type WorkflowParam = {
  name: string;
  path: string;
  description: string;
  valueType: string | number;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

type Props = {
  slug: string;
};

const CommonWorkflow: React.FC<Props> = ({ slug }) => {
  // 生产环境下，需要从服务器用slug查询以获取workflowSetting
  // const workflowSetting = getWorkflowSetting(slug) as any;
  const jsonName = slug ? `${slug}_setting.json` : "current_setting.json";
  const workflowSetting = require(`../../public/workflows/${jsonName}`);

  const { workflow, workflowTitle, description, author, params } =
    workflowSetting;
  const exposedParams: WorkflowParam[] = params;

  const [results, setResults] = useState<Array<Blob>>([]);
  const [disableButton, setDisableButton] = useState(false);
  const [status, setStatus] = useState("生成结果");

  ws.onerror = (event) => {
    console.log("ws.onerror", event);
    setStatus("连接服务器失败");
  };

  // 使用暴露的参数列表生成表单schema
  const formSchemaPrototype = exposedParams.reduce(
    (accumulator: { [key: string]: z.ZodType<string> }, currentParam) => {
      accumulator[currentParam.name] = z.string();
      return accumulator;
    },
    {}
  );
  // 使用暴露的参数列表生成表单默认值
  const formSchemaDefalutValues = exposedParams.reduce(
    (accumulator: { [key: string]: string }, currentParam) => {
      if (currentParam.valueType === "boolean") {
        accumulator[currentParam.name] = "true";
      } else if (currentParam.valueType === "interger") {
        accumulator[currentParam.name] = "1";
      } else if (currentParam.valueType === "float") {
        accumulator[currentParam.name] = "1.0";
      } else if (
        currentParam.valueType === "string" ||
        currentParam.valueType === "upload"
      ) {
        accumulator[currentParam.name] = "";
      }
      return accumulator;
    },
    {}
  );
  // 使用暴露的参数列表生成表单
  const formSchema = z.object(formSchemaPrototype);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formSchemaDefalutValues,
  });

  async function onSubmit(value: z.infer<typeof formSchema>) {
    setDisableButton(true);
    setStatus("正在生成结果");
    setResults([]);
    // 遍历参数，将表单中的值赋值到workflow中
    exposedParams.forEach((param) => {
      const currentValue = value[param.name];

      // 当参数并非必填，而且值为默认值时，不去修改workflow里对应的值
      if (
        param.required === false &&
        (currentValue === "" ||
          currentValue === "1" ||
          currentValue === "1.0" ||
          currentValue === "true")
      )
        return;

      //根据路径修改workflow中的值
      const regex = /(\d+)\/(.+)/;
      const match = param.path.match(regex);

      if (match) {
        const workflowIndex = match[1];
        const pathParts = match[2].split("/");

        let current = workflow[workflowIndex as keyof typeof workflow] as any;
        let parent: any;
        let lastPart = "";

        for (const part of pathParts) {
          parent = current;
          lastPart = part;
          current = current[part];
        }

        parent[lastPart] = currentValue;
      }
    });

    const results = await getResults(
      ws,
      workflow,
      clientId,
      server_address,
      setStatus,
      setDisableButton
    );

    const blobs: Blob[] = [];
    for (const key in results) {
      if (Object.prototype.hasOwnProperty.call(results, key)) {
        const imagesOutput = results[key];
        imagesOutput.map((result: Blob) => {
          blobs.push(result);
        });
      }
    }
    setResults(blobs);
    setDisableButton(false);
  }

  return (
    <div className="mx-auto">
      <div className="grid grid-rows-1 m-2 p-1 rounded-2xl border-4 border-dashed border-primary-500">
        <div className="text-3xl text-center my-2 ">{workflowTitle}</div>
        <p>作者：{author}</p>
        <p>描述：{description}</p>
      </div>
      <div className="flex flex-row">
        <div className="flex-2 m-2 rounded-2xl border-4 border-dashed border-primary-500">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full"
            >
              <div className="flex flex-row">
                <div className="flex-1 m-2 rounded-xl justify-between">
                  <div className="grid grid-cols-2  space-x-1 ">
                    {
                      /* 遍历暴露的参数列表，生成表单 */
                      exposedParams.map((param, key) => {
                        const { name, valueType, description, required } =
                          param;

                        if (valueType === "string") {
                          return (
                            <FormField
                              key={key}
                              control={form.control}
                              name={name}
                              {...(required && {
                                rules: { required: "不能为空" },
                              })}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{name}</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder={`请输入${description}`}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          );
                        } else if (valueType === "interger") {
                          const { min, max, step } = param;
                          return (
                            <FormField
                              key={key}
                              control={form.control}
                              name={name}
                              {...(required && {
                                rules: { required: "不能为空" },
                              })}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{name}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={min || 1}
                                      max={max || 8}
                                      step={step || 1}
                                      defaultValue={min || 1}
                                      placeholder={`请输入${description}`}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          );
                        } else if (valueType === "float") {
                          const { min, max, step } = param;
                          return (
                            <FormField
                              key={key}
                              control={form.control}
                              name={name}
                              {...(required && {
                                rules: { required: "不能为空" },
                              })}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{name}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={min || 1.0}
                                      max={max || 8.0}
                                      step={step || 0.01}
                                      defaultValue={min || 1.0}
                                      placeholder={`请输入${description}`}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          );
                        }
                      })
                    }
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-md mb-auto mt-4 "
                    disabled={disableButton}
                  >
                    提交
                  </Button>
                </div>

                <div className="flex-1 m-2 rounded-xl justify-between">
                  {
                    /* 遍历暴露的参数列表，生成上传图片区域 */
                    exposedParams.map((param, key) => {
                      const { name, valueType, description, required } = param;

                      if (valueType === "upload") {
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name={name}
                            {...(required && {
                              rules: { required: "不能为空" },
                            })}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{description}</FormLabel>
                                <FormControl>
                                  <FileUploader
                                    onFileloaded={(fileName) => {
                                      form.setValue(name, fileName);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          ></FormField>
                        );
                      }
                    })
                  }
                </div>
              </div>
            </form>
          </Form>
        </div>
        <div className="flex-1 m-2 p-2 justify-center items-center rounded-2xl border-4 border-dashed border-primary-500">
          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {results.map((blob, index) => {
                const resultType = blob.type;
                console.log(resultType);
                const url = URL.createObjectURL(blob);
                if (resultType == "image/png") {
                  return (
                    <Image
                      key={index}
                      src={url}
                      alt="result"
                      width={300}
                      height={300}
                      className="rounded-xl mx-1"
                    />
                  );
                } else if (resultType == "video/h264-mp4") {
                  return (
                    <ReactPlayer
                      key={index}
                      url={url}
                      width={400}
                      controls={true}
                      playing={false}
                      className="rounded-xl mx-1"
                    />
                  );
                }
              })}
            </div>
          )}
          {results.length == 0 && (
            <div className="grid grid-flow-row justify-center items-center">
              {status.split("|").map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonWorkflow;
