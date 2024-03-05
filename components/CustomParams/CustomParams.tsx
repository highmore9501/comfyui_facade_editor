import React from "react";
import { Controller } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  form: any;
  index: number;
  valueType: string;
};

const CustomParams: React.FC<Props> = ({ form, index, valueType }) => {
  return (
    <div>
      <Controller
        name={`params.${index}.name`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>参数名称</FormLabel>
            <FormControl>
              <Input type="string" placeholder="请输入参数名称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.path`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>参数路径</FormLabel>
            <FormControl>
              <Input
                type="string"
                placeholder="请输入参数路径，例如`49/inputs/text`"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.description`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>参数描述</FormLabel>
            <FormControl>
              <Input type="string" placeholder="请输入参数描述" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.required`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>是否必填</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="该参数是否必填" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.valueType`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>参数类型</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择参数类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">字符串</SelectItem>
                  <SelectItem value="upload">上传文件</SelectItem>
                  <SelectItem value="interger">整数</SelectItem>
                  <SelectItem value="float">浮点数</SelectItem>
                  <SelectItem value="seed">种子</SelectItem>
                  <SelectItem value="boolean">布尔值</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(valueType === "interger" ||
        valueType === "float" ||
        valueType === "seed") && (
        <>
          <Controller
            name={`params.${index}.min`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>最小值（选填）</FormLabel>
                <FormControl>
                  <Input type="number" defaultValue={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            name={`params.${index}.max`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>最大值（选填）</FormLabel>
                <FormControl>
                  <Input type="number" defaultValue={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            name={`params.${index}.step`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>步长（选填）</FormLabel>
                <FormControl>
                  <Input type="number" defaultValue={0.1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default CustomParams;
