import React from "react";

type ComfyUIWorkFlow = {
  name: string;
  slug: string;
};

const comfyUIWorkFlows: ComfyUIWorkFlow[] = [
  {
    name: "图像转换图像",
    slug: "sdxl_img2img",
  },
  {
    name: "视频转换风格",
    slug: "video_style_change",
  },
];

const PageNavigator = () => {
  return (
    <aside className="w-[150px] m-2 p-2 rounded-2xl border-4 border-dashed border-primary-500 ">
      <h1 className="text-xl text-center pb-4">工作流列表</h1>
      <div className="space-y-4">
        {comfyUIWorkFlows.map((workflow) => (
          <a
            key={workflow.slug}
            href={`/?slug=${workflow.slug}`}
            className="block rounded-lg bg-primary-500 text-center border-4 border-dashed cursor-pointer"
          >
            {workflow.name}
          </a>
        ))}
      </div>
    </aside>
  );
};

export default PageNavigator;
