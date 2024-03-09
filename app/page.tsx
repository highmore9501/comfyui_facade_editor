"use client";
import CommonWorkflow from "@/components/CommonWorkflow/CommonWorkflow";
import Header from "@/components/Header/Head";
import PageNavigator from "@/components/PageNavigator/PageNavigator";
import { useSearchParams } from "next/navigation";
import { IntlProvider } from "react-intl";
import Chinese from "@/language/chinese.json";
import English from "@/language/english.json";

const chineseLanguageList = ["zh", "zh-CN", "zh-TW", "zh-HK", "zh-MO"];
const local = typeof navigator !== "undefined" ? navigator.language : "zh-CN";

let lang: any;
if (chineseLanguageList.includes(local)) {
  lang = Chinese;
} else {
  lang = English;
}

export default function Home() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const currentWorkFlow = slug ? slug.toString() : "sdxl_img2img";

  return (
    <IntlProvider locale={local} messages={lang}>
      <Header />
      <div className="flex pt-4">
        <PageNavigator />
        <CommonWorkflow slug={currentWorkFlow} />
      </div>
    </IntlProvider>
  );
}
