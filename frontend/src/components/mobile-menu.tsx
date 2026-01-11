"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export function MobileMenu() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "sm:hidden fixed bottom-0 left-0 right-0",
        "bg-white border-t border-gray-200 z-50",
      )}
    >
      <div className={cn("flex justify-around items-center h-16")}>
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            pathname === "/"
              ? "text-primary-base"
              : "text-gray-500 hover:text-primary-base",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>支払い</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>支払い</span>
        </Link>
        <Link
          href="/repayments"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            pathname.startsWith("/repayments")
              ? "text-primary-base"
              : "text-gray-500 hover:text-primary-base",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>返済</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>返済</span>
        </Link>
        <Link
          href="/groups"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            pathname.startsWith("/groups")
              ? "text-primary-base"
              : "text-gray-500 hover:text-primary-base",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>グループ</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>グループ</span>
        </Link>
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            pathname === "/profile"
              ? "text-primary-base"
              : "text-gray-500 hover:text-primary-base",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>プロフィール</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>プロフィール</span>
        </Link>
      </div>
    </nav>
  );
}
