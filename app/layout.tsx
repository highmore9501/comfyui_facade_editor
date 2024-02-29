import type { Metadata } from "next";
import "./globals.css";
import {NextAuthProvider} from "@/components/AuthProvider/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider/ThemeProvider";
import Toast from "@/components/Toast/Toast";
import { Poppins } from "next/font/google";

// Poppins字体包;
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ['400','500', '700', '900'],
  style: ['normal', 'italic'],
  variable:'--font-poppins',
});

export const metadata: Metadata = {
  title: "ComfyUI API 测试器",
  description: "为用户提供简易comfyUI使用界面",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link 
          rel="stylesheet" 
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css'
          crossOrigin='anonymous'
        />
      </head>
      <body className={poppins.className}>
        <ThemeProvider>
          <Toast />
          <main className="font-normal">
              {children}
          </main>          
        </ThemeProvider>
      </body>
    </html>
  );
}
