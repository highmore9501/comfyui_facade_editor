"use client";

import React from "react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import ExpandableDiv from "./ExpandableDiv";
import { message } from "antd";
import CustomParams from "../CustomParams/CustomParams";
import { useIntl } from "react-intl";

const paramSchema = z.object({
  name: z.string(),
  path: z.string(),
  description: z.string(),
  valueType: z.string(),
  required: z.string(),
  min: z.string(),
  max: z.string(),
  step: z.string(),
});

const formSchema = z.object({
  workflow: z.string(),
  slug: z.string(),
  workflowTitle: z.string(),
  description: z.string(),
  author: z.string(),
  params: z.array(paramSchema),
});

const WorkflowEditor = () => {
  const intl = useIntl();

  const [disableButton, setDisableButton] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workflow: "",
      slug: "",
      workflowTitle: "",
      description: "",
      author: intl.formatMessage({
        id: "components.WorkflowEditor.anonymous",
      }),
      params: [
        {
          name: "",
          path: "",
          description: "",
          valueType: "",
          required: "",
          min: "",
          max: "",
          step: "",
        },
      ],
    },
  });
  const paramForm = useForm<z.infer<typeof paramSchema>>({
    resolver: zodResolver(paramSchema),
    defaultValues: {
      name: "",
      path: "",
      description: "",
      valueType: "",
      required: "",
      min: "",
      max: "",
      step: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "params",
  });

  function onSubmit(value: z.infer<typeof formSchema>) {
    setDisableButton(true);
    const { workflow, workflowTitle, slug, params } = value;
    // 检测workflow是否是json格式
    let workflowJson: any;
    try {
      workflowJson = JSON.parse(workflow);
    } catch (e) {
      message.error(
        intl.formatMessage({
          id: "components.WorkflowEditor.notJson",
        })
      );
      return;
    }
    // 检测workflowJson内容是否合法，防止有人把ui.json当api.json复制过来
    for (const [key, value] of Object.entries(workflowJson)) {
      if (
        isNaN(parseInt(key)) ||
        typeof value !== "object" ||
        !value ||
        !value.hasOwnProperty("class_type")
      ) {
        message.error(
          intl.formatMessage({
            id: "components.WorkflowEditor.illegalWorkflow",
          })
        );
        return;
      }
    }
    // 检测各值格式是否合规
    if (workflowTitle === "") {
      message.error(
        intl.formatMessage({
          id: "components.WorkflowEditor.emptyName",
        })
      );
      return;
    }
    if (workflowTitle.length > 50) {
      message.error(
        intl.formatMessage({
          id: "components.WorkflowEditor.nameIsTooLong",
        })
      );
      return;
    }
    if (slug === "") {
      message.error(
        intl.formatMessage({
          id: "components.WorkflowEditor.emptySlug",
        })
      );
      return;
    }
    if (!/^[a-zA-Z0-9]*$/.test(slug)) {
      message.error(
        intl.formatMessage({
          id: "components.WorkflowEditor.errorSlug",
        })
      );
      return;
    }
    // 检测用户可修改参数是否合规
    let params_result: any[] = [];
    let paramHasError = false;
    params.forEach((param) => {
      if (paramHasError) {
        return;
      }

      if (param.name === "") {
        message.error(
          intl.formatMessage({
            id: "components.WorkflowEditor.emptyParam",
          })
        );
        paramHasError = true;
        return;
      }
      if (param.path === "") {
        message.error(
          intl.formatMessage({
            id: "components.WorkflowEditor.emptyPath",
          })
        );
        paramHasError = true;
        return;
      }

      if (!/^[a-zA-Z0-9]*$/.test(param.name)) {
        message.error(
          intl.formatMessage({
            id: "components.WorkflowEditor.errorParam",
          })
        );
        paramHasError = true;
        return;
      }
      const regex = /([^\/]+)/g;
      try {
        const match = param.path.match(regex);

        if (match) {
          const workflowIndex = match[0];
          // pathParts是match余下的部分
          const pathParts = match.slice(1);

          let current = workflowJson[workflowIndex as string] as any;
          let parent: any;
          let lastPart = "";

          for (const part of pathParts) {
            parent = current;
            lastPart = part;
            current = current[part];
          }
        }
      } catch (e) {
        console.log(e);
        message.error(
          intl.formatMessage(
            {
              id: "components.WorkflowEditor.illgalPath",
            },
            { name: param.name }
          )
        );
        paramHasError = true;
        return;
      }

      const paramName = param.name;
      const paramDescription = param.description;
      const paramPath = param.path;

      const paramValueType = param.valueType == "" ? "string" : param.valueType;
      const paramRequired =
        param.required == "" || param.required == "true" ? true : false;

      let paramMin, parmaMax, paramStep;

      if (paramValueType == "interger" || paramValueType == "seed") {
        paramMin = param.min == "" ? 1 : parseInt(param.min);
        parmaMax = param.max == "" ? 4 : parseInt(param.max);
        paramStep = param.step == "" ? 1 : parseInt(param.step);
      } else if (paramValueType == "float") {
        paramMin = param.min == "" ? 1.0 : parseFloat(param.min);
        parmaMax = param.max == "" ? 4.0 : parseFloat(param.max);
        paramStep = param.step == "" ? 0.1 : parseFloat(param.step);
      } else {
        paramMin = "";
        parmaMax = "";
        paramStep = "";
      }

      if (
        paramValueType == "interger" ||
        paramValueType == "float" ||
        paramValueType == "seed"
      ) {
        params_result.push({
          name: paramName,
          description: paramDescription,
          path: paramPath,
          valueType: paramValueType,
          required: paramRequired,
          min: paramMin,
          max: parmaMax,
          step: paramStep,
        });
      } else {
        params_result.push({
          name: paramName,
          description: paramDescription,
          path: paramPath,
          valueType: paramValueType,
          required: paramRequired,
        });
      }
    });

    if (paramHasError) {
      setDisableButton(false);
      return;
    }

    const result = {
      workflow: workflowJson,
      workflowTitle: workflowTitle,
      slug: slug,
      description: value.description,
      author: value.author,
      params: params_result,
    };

    // 生产环境下应该把result保存到数据库，让用户可以通过slug来查询它，并且在CommonWorkflow.tsx里通过它来生成界面
    // 开发环境下仅result以json文件保存并下载
    const blob = new Blob([JSON.stringify(result)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `${slug}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDisableButton(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex container p-4"
      >
        <div className="flex-1 p-2">
          <FormField
            key="workflow"
            name="workflow"
            rules={{ required: "工作流内容不能为空" }}
            control={form.control}
            render={({ field }) => (
              <FormItem className="h-full w-full">
                <FormLabel>
                  {intl.formatMessage({
                    id: "components.WorkflowEditor.workflow",
                  })}
                </FormLabel>
                <FormControl className="h-full w-full">
                  <Textarea
                    className="h-full w-full"
                    placeholder={intl.formatMessage({
                      id: "components.WorkflowEditor.copyWorkflow",
                    })}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1 p-2 space-y-2">
          <FormField
            key="workflowTitle"
            name="workflowTitle"
            control={form.control}
            rules={{ required: "工作流名称不能为空" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {intl.formatMessage({
                    id: "components.WorkflowEditor.workflow",
                  })}
                </FormLabel>
                <FormControl>
                  <Input
                    type="string"
                    placeholder={intl.formatMessage({
                      id: "components.WorkflowEditor.workflowName",
                    })}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            key="slug"
            name="slug"
            control={form.control}
            rules={{ required: "缩写不能为空" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {intl.formatMessage({
                    id: "components.WorkflowEditor.slug",
                  })}
                </FormLabel>
                <FormControl>
                  <Input
                    type="string"
                    placeholder={intl.formatMessage({
                      id: "components.WorkflowEditor.errorSlug",
                    })}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            key="description"
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {intl.formatMessage({
                    id: "components.CommonWorkflow.description",
                  })}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={intl.formatMessage({
                      id: "components.WorkflowEditor.descriptionDetails",
                    })}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            key="author"
            name="author"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {intl.formatMessage({
                    id: "components.CommonWorkflow.author",
                  })}
                </FormLabel>
                <FormControl>
                  <Input type="string" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-between pt-2">
            <FormLabel>
              {intl.formatMessage({
                id: "components.WorkflowEditor.userdefinedParamsList",
              })}
            </FormLabel>
            {fields.map((field, index) => {
              const valueType = form.watch(`params.${index}.valueType`);
              return (
                <ExpandableDiv
                  key={field.id}
                  removeButton={
                    <button onClick={() => remove(index)}>
                      {intl.formatMessage({
                        id: "components.WorkflowEditor.delete",
                      })}
                    </button>
                  }
                  content={
                    <CustomParams
                      form={form}
                      index={index}
                      valueType={valueType}
                    />
                  }
                ></ExpandableDiv>
              );
            })}
            <div
              className="w-full cursor-pointer text-center border border-gray-300 p-2 rounded-md mb-10 hover:bg-gray-500"
              onClick={() =>
                append({
                  name: "",
                  path: "",
                  description: "",
                  valueType: "string",
                  required: "false",
                  min: "",
                  max: "",
                  step: "",
                })
              }
            >
              {intl.formatMessage({
                id: "components.WorkflowEditor.addNewParam",
              })}
            </div>
            <div className="mt-auto">
              <Button
                type="submit"
                className="w-full text-2xl"
                disabled={disableButton}
              >
                {intl.formatMessage({
                  id: "components.WorkflowEditor.save",
                })}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default WorkflowEditor;
