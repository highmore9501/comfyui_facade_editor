import ImageToImage from "@/components/ImageToImage/ImageToImage";

export default function Home() {
  return (
    <>
      <div className="w-full text-3xl">名称与logo</div>
      <div className="grid grid-cols-2">
        <aside>导航栏</aside>
        <ImageToImage />
      </div>
    </>
  );
}
