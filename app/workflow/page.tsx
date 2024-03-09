"use client";

import WorkflowEditor from "@/components/WorkflowEditor/WorkflowEditor";
import Header from "@/components/Header/Head";

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
  return (
    <IntlProvider locale={local} messages={lang}>
      <Header />
      <WorkflowEditor />
    </IntlProvider>
  );
}
