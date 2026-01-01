import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { cn } from "@/utils/cn";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

type Props = Readonly<{
  children: React.ReactNode;
}>;

export const metadata: Metadata = {
  title: "Datti - 立て替え管理アプリ",
  description: "誰にいくら払ったっけ？を記録するサービス",
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ja">
      <body className={cn(notoSansJP.variable, "antialiased")}>{children}</body>
    </html>
  );
}
