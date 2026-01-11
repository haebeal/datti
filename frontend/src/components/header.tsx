"use client";

import { Menu } from "lucide-react";
import { cn } from "@/utils/cn";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={cn("bg-white shadow-sm", "lg:hidden")}>
      <div className={cn("flex h-16 items-center justify-between px-4")}>
        <button
          onClick={onMenuClick}
          className={cn("p-2 rounded-md", "hover:bg-gray-100")}
          aria-label="メニューを開く"
        >
          <Menu className={cn("w-6 h-6")} />
        </button>
        <span className={cn("text-xl font-bold text-primary-base")}>Datti</span>
        <div className={cn("w-10")} /> {/* Spacer for centering */}
      </div>
    </header>
  );
}
