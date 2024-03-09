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
import { FormattedMessage, useIntl } from "react-intl";

type Props = {
  slug: string;
};

const CommonWorkflow: React.FC<Props> = ({ slug }) => {
  const intl = useIntl();
  // 生产环境下，需要从服务器用slug查询以获取workflowSetting
  // const workflowSetting = getWorkflowSetting(slug) as any;
  const jsonName = slug ? `${slug}_setting.json` : "current_setting.json";
  const workflowSetting = require(`../../public/workflows/${jsonName}`);

  const { workflow, workflowTitle, description, author, params } =
    workflowSetting;
  const exposedParams: WorkflowParam[] = params;

  const [results, setResults] = useState<Array<Blob>>([]);
  const [disableButton, setDisableButton] = useState(false);
  const [status, setStatus] = useState(
    intl.formatMessage({
      id: "components.CommonWorkflow.generateResult",
    })
  );

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
      } else if (currentParam.valueType === "seed") {
        accumulator[currentParam.name] = "0";
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

  const hasUpload = exposedParams.some((param) => param.valueType === "upload");

  async function onSubmit(formData: z.infer<typeof formSchema>) {
    setDisableButton(true);
    setStatus(
      intl.formatMessage({
        id: "components.CommonWorkflow.generating",
      })
    );
    setResults([]);
    // 遍历参数，将表单中的值赋值到workflow中
    exposedParams.forEach((param) => {
      let currentValue;
      if (param.valueType === "seed" && formData[param.name] === "0") {
        currentValue = Math.floor(Math.random() * 1000000000);
      } else {
        currentValue = formData[param.name];
      }

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
      const regex = /([^\/]+)/g;
      const match = param.path.match(regex);

      if (match) {
        const workflowIndex = match[0];
        const pathParts = match.slice(1);

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
      workflow,
      intl,
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
    <div className="w-full">
      <div className="grid grid-rows-1 m-2 rounded-2xl border-4 border-line border-primary-500 ">
        <div className="text-4xl text-center rounded-t-xl bg-slate-200 dark:bg-slate-500 mb-2 py-1 ">
          {workflowTitle}
        </div>
        <div className="px-2 mb-2">
          <p>
            <FormattedMessage id="components.CommonWorkflow.author" />：{author}
          </p>
          <p>
            <FormattedMessage id="components.CommonWorkflow.description" />：
            {description}
          </p>
        </div>
      </div>
      <ParamsInput
        exposedParams={exposedParams}
        onSubmit={onSubmit}
        disableButton={disableButton}
        form={form}
        hasUpload={hasUpload}
      />
      <ResultDisplayer results={results} status={status} />
    </div>
  );
};

export default CommonWorkflow;
