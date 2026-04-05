"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ArrowLeft } from "lucide-react";
import { cn } from "@/utils/cn";

type PageConfig = {
  title: string;
  back?: string;
};

function getPageConfig(pathname: string): PageConfig {
  if (pathname === "/") return { title: "ホーム" };
  if (pathname === "/repayments") return { title: "返した記録" };
  if (pathname === "/repayments/new") return { title: "返す", back: "/repayments" };
  if (pathname.startsWith("/repayments/")) return { title: "返した記録", back: "/repayments" };
  if (pathname === "/groups") return { title: "グループ" };
  if (pathname === "/groups/new") return { title: "グループ作成", back: "/groups" };
  if (pathname.endsWith("/lendings/new")) {
    const groupPath = pathname.replace("/lendings/new", "/lendings");
    return { title: "立て替えを追加", back: groupPath };
  }
  if (pathname.endsWith("/settings")) {
    const groupPath = pathname.replace("/settings", "/lendings");
    return { title: "グループ設定", back: groupPath };
  }
  if (pathname === "/profile") return { title: "マイページ" };
  return { title: "ホーム" };
}

export function Header() {
  const pathname = usePathname();
  const config = getPageConfig(pathname);

  // グループ詳細(イベント/メンバー)は独自ヘッダーを持つので非表示
  const isGroupDetail = /^\/groups\/[^/]+\/lendings$/.test(pathname);
  if (isGroupDetail) return null;

  if (config.back) {
    // サブページ: ← タイトル(中央)
    return (
      <header
        className={cn(
          "sm:hidden",
          "flex items-center",
          "h-16 px-4",
        )}
      >
        <Link
          href={config.back}
          className={cn("p-2 -ml-2 rounded-md")}
          aria-label="戻る"
        >
          <ArrowLeft className={cn("w-6 h-6 text-primary-base")} />
        </Link>
        <div className="flex-1" />
        <span className={cn("text-base font-semibold text-primary-base")}>
          {config.title}
        </span>
        <div className="flex-1" />
        <div className="w-6" />
      </header>
    );
  }

  // メインページ: タイトル(左) + ベル(右)
  return (
    <header
      className={cn(
        "sm:hidden",
        "flex items-center justify-between",
        "h-16 px-4",
      )}
    >
      <span className={cn("text-base font-semibold text-primary-base")}>
        {config.title}
      </span>
      <button
        type="button"
        className={cn("p-2 -mr-2 rounded-md")}
        aria-label="通知"
      >
        <Bell className={cn("w-6 h-6 text-primary-base")} />
      </button>
    </header>
  );
}
