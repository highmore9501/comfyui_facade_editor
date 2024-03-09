import React from "react";
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
import { WorkflowParam } from "@/types/types";
import { FormattedMessage } from "react-intl";

type Props = {
  exposedParams: WorkflowParam[];
  onSubmit: any;
  disableButton: boolean;
  form: any;
  hasUpload: boolean;
};

const ParamsInput: React.FC<Props> = ({
  exposedParams,
  onSubmit,
  disableButton,
  form,
  hasUpload,
}) => {
  return (
    <div className="m-2 rounded-2xl border-4 border-line border-primary-500">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="flex flex-row">
            <div className="flex-1 flex flex-col m-2 space-y-2">
              {
                /* 遍历暴露的参数列表，生成表单 */
                exposedParams.map((param, key) => {
                  const { name, valueType, description, required } = param;
                  const labelText = `${name} : ${description}`;
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
                            <FormLabel>{labelText}</FormLabel>
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
                            <FormLabel>{labelText}</FormLabel>
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
                  } else if (valueType === "seed") {
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
                            <FormLabel>{labelText}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={min || 0}
                                max={max || 1000000000}
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
                            <FormLabel>{labelText}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={min || 0.0}
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
              <div className="mt-auto">
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={disableButton}
                >
                  <FormattedMessage id="components.ParamsInput.submit" />
                </Button>
              </div>
            </div>

            {hasUpload && (
              <div className="flex-1 m-2 justify-between">
                {
                  /* 遍历暴露的参数列表，生成上传图片区域 */
                  exposedParams.map((param, key) => {
                    const { name, valueType, description, required } = param;
                    const labelText = `${name} : ${description}`;

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
                              <FormLabel>{labelText}</FormLabel>
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
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ParamsInput;
