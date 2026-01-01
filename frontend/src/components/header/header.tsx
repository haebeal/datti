"use client";

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
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className={cn("text-xl font-bold text-[#0d47a1]")}>Datti</span>
        <div className={cn("w-10")} /> {/* Spacer for centering */}
      </div>
    </header>
  );
}
