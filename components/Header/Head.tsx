"use client";

import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import ThemeContext from "@/context/themeContext";
import Link from "next/link";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import { FormattedMessage } from "react-intl";

const Header = () => {
  const { darkTheme, setDarkTheme } = useContext(ThemeContext);
  const [isEditor, setIsEditor] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      setIsEditor(pathname === "/workflow");
    }
  }, [pathname]);

  return (
    <header className="py-10 px-4 container mx-auto text-xl flex flex-warp md:flex-nowrap items-center justify-between">
      <div className="flex items-center w-full md:2/3">
        <Link
          href="/"
          className={`rounded-xl font-black ${
            isEditor ? "" : "bg-slate-200 dark:bg-slate-500"
          }`}
        >
          <FormattedMessage id="components.Header.title" />
        </Link>
        <ul className="flex items-center ml-5">
          <li className="ml-2">
            {darkTheme ? (
              <MdOutlineLightMode
                className="cursor-pointer"
                onClick={() => {
                  setDarkTheme(false);
                  localStorage.removeItem("ComfyUI-theme");
                }}
              />
            ) : (
              <MdDarkMode
                className="cursor-pointer"
                onClick={() => {
                  setDarkTheme(true);
                  localStorage.setItem("ComfyUI-theme", "true");
                }}
              />
            )}
          </li>
        </ul>
        <Link
          href="/workflow"
          className={`rounded-xl font-black ml-auto ${
            isEditor ? "bg-slate-200 dark:bg-slate-500" : ""
          }`}
        >
          <FormattedMessage id="components.Header.workflowEditor" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
