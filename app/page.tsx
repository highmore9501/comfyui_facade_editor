import CommonWorkflow from "@/components/CommonWorkflow/CommonWorkflow";

export default function Home() {
  return (
    <>
      <div className="w-full text-3xl">名称与logo</div>
      <div className="flex">
        <aside className="w-[200px] text-3xl text-center">导航栏</aside>
        <CommonWorkflow slug="sdxl_img2img" />
      </div>
    </>
  );
}
