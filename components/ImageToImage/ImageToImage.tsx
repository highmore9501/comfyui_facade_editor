"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/UploadImage/UploadImage";
import { queuePrompt } from "@/utils/comfyui";
import workflow from "./workflow.json";
import { randomUUID } from "crypto";

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  negative: z.string(),
  refImage: z.string(),
});

export function ImageToImage() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      negative: "",
      refImage: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    const { prompt, negative, refImage } = values;
    workflow[55].inputs.text = prompt;
    workflow[49].inputs.text = negative;
    workflow[44].inputs.image = refImage;
    const clientId = randomUUID();
    const serverAddress = process.env.SERVER_ADDRESS as string;
    console.log(serverAddress);
    const response = queuePrompt(workflow, clientId, serverAddress);

    console.log(response);
  }

  return (
    <Form {...form}>
      <div className="container">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-2">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>提示词</FormLabel>
                <FormControl>
                  <Input placeholder="请输入提示词" {...field} />
                </FormControl>
                <FormDescription>描述图片的提示词</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="negative"
            render={({ field }) => (
              <FormItem>
                <FormLabel>负面提示词</FormLabel>
                <FormControl>
                  <Input placeholder="负面提示词" {...field} />
                </FormControl>
                <FormDescription>不想在出图片中出现的内容</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="refImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>参考图片</FormLabel>
                <FormControl>
                  <ImageUpload
                    onImageUpload={(imageName) => {
                      form.setValue("refImage", imageName);
                    }}
                  />
                </FormControl>
                <FormDescription>上传一张参考图片</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>

          <Button type="submit">提交</Button>
        </form>
      </div>
    </Form>
  );
}

export default ImageToImage;
