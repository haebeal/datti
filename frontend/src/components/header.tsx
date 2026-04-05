"use client";

import Image from "next/image";
import { Menu, Bell } from "lucide-react";
import { cn } from "@/utils/cn";

export function Header() {
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
      <div className={cn("flex items-center gap-1")}>
        <Image
          src="/logo.svg"
          alt=""
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className={cn("text-xl font-bold text-primary-base")}>atti</span>
      </div>
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
