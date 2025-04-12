import "@radix-ui/themes/styles.css";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Metadata } from "next";

import { ThemeProvider } from "next-themes";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "真实地址生成器",
  description: "基于IP地址生成真实地址",
  keywords:
    "IP地址, 地址生成器, 地理位置, IP定位, IP查询, IP地址查询, 地理位置查询, 位置生成器, 地址查询工具, IP工具, 地址定位, 位置信息",
  authors: [{ name: "GuooGaii" }],
  openGraph: {
    title: "真实地址生成器",
    description: "基于IP地址生成真实地址",
    type: "website",
    locale: "zh_CN",
    siteName: "真实地址生成器",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class">
          <Theme accentColor="cyan">{children}</Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
