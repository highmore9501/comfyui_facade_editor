"use client";

import React from "react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ResultDisplayer from "@/components/ResultDisplayer/ResultDisplayer";
import ParamsInput from "../ParamsInput/ParamsInput";
import { getResults } from "@/utils/comfyui";
import { WorkflowParam } from "@/types/types";

// 生产环境下这个值从服务器查询获得
// import workflowSetting from "@/public/workflows/current_setting.json";

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

    const results = await getResults(workflow, setStatus, setDisableButton);

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
    <div className="w-full">
      <div className="grid grid-rows-1 m-2 p-1 rounded-2xl border-4 border-dashed border-primary-500">
        <div className="text-3xl text-center my-2 ">{workflowTitle}</div>
        <p>作者：{author}</p>
        <p>描述：{description}</p>
      </div>
      <ParamsInput
        exposedParams={exposedParams}
        onSubmit={onSubmit}
        disableButton={disableButton}
        form={form}
      />
      <ResultDisplayer results={results} status={status} />
    </div>
  );
};

export default CommonWorkflow;
