import React from "react";
import comfyUIWorkFlows from "@/public/workflows/comfyUIWorkFlows.json";

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
