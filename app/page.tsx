"use client";
import CommonWorkflow from "@/components/CommonWorkflow/CommonWorkflow";
import Header from "@/components/Header/Head";
import PageNavigator from "@/components/PageNavigator/PageNavigator";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  console.log(slug);
  const currentWorkFlow = slug ? slug.toString() : "sdxl_img2img";

  return (
    <>
      <Header />
      <div className="flex pt-4">
        <PageNavigator />
        <CommonWorkflow slug={currentWorkFlow} />
      </div>
    </>
  );
}
