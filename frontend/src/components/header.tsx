"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { cn } from "@/utils/cn";

const PAGE_TITLES: Record<string, string> = {
  "/": "ホーム",
  "/repayments": "返した記録",
  "/groups": "グループ",
  "/profile": "マイページ",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/repayments")) return "返した記録";
  if (pathname.startsWith("/groups")) return "グループ";
  return "ホーム";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  // グループ詳細は独自ヘッダーを持つので非表示
  const isGroupDetail = /^\/groups\/[^/]+\/(lendings|settings)/.test(pathname);
  if (isGroupDetail) return null;

  return (
    <header
      className={cn(
        "sm:hidden",
        "flex items-center",
        "h-16 px-4",
        "bg-white",
        "border-b border-gray-200",
      )}
    >
      <button
        type="button"
        className={cn("p-2 rounded-md", "hover:bg-gray-100")}
        aria-label="メニューを開く"
      >
        <Menu className={cn("w-6 h-6 text-primary-base")} />
      </button>
      <div className="flex-1" />
      <span className={cn("text-base font-semibold text-primary-base")}>
        {title}
      </span>
      <div className="flex-1" />
      <button
        type="button"
        className={cn("p-2 rounded-md", "hover:bg-gray-100")}
        aria-label="通知"
      >
        <Bell className={cn("w-6 h-6 text-primary-base")} />
      </button>
    </header>
  );
}
