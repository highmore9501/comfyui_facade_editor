import React from "react";
import comfyUIWorkFlows from "@/public/workflows/comfyUIWorkFlows.json";
import { useSearchParams } from "next/navigation";
import { FormattedMessage } from "react-intl";

const PageNavigator = () => {
  const currentSlug = useSearchParams().get("slug");
  return (
    <aside className="w-[150px] m-2 rounded-2xl border-4 border-line border-primary-500 ">
      <h1 className="text-xl text-center py-4">
        <FormattedMessage id="components.PageNavigator.title" />
      </h1>
      <div className="space-y-4">
        {comfyUIWorkFlows.map((workflow) => (
          <a
            key={workflow.slug}
            href={`/?slug=${workflow.slug}`}
            className={`block py-4 text-center  cursor-pointer ${
              workflow.slug === currentSlug
                ? "bg-slate-200 dark:bg-slate-500"
                : ""
            }`}
          >
            {workflow.name}
          </a>
        ))}
      </div>
    </aside>
  );
};

export default PageNavigator;
