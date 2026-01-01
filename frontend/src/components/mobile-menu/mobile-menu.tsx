"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export function MobileMenu() {
  const pathname = usePathname();
  const groupId = pathname.match(/\/groups\/([^/]+)/)?.[1];

  const getGroupPath = (path: string) => {
    return groupId ? `/groups/${groupId}${path}` : path;
  };

  const isActive = (path: string) => pathname.includes(path);

  return (
    <nav
      className={cn(
        "sm:hidden fixed bottom-0 left-0 right-0",
        "bg-white border-t border-gray-200 z-50",
      )}
    >
      <div className={cn("flex justify-around items-center h-16")}>
        <Link
          href="/credit"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            pathname === "/credit"
              ? "text-[#0d47a1]"
              : "text-gray-500 hover:text-[#0d47a1]",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>債権</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>債権</span>
        </Link>
        <Link
          href={getGroupPath("/borrowing")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            isActive("/borrowing")
              ? "text-[#0d47a1]"
              : "text-gray-500 hover:text-[#0d47a1]",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>借り入れ</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>借り入れ</span>
        </Link>
        <Link
          href={getGroupPath("/lendings")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            isActive("/lendings")
              ? "text-[#0d47a1]"
              : "text-gray-500 hover:text-[#0d47a1]",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>立て替え</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>立て替え</span>
        </Link>
        <Link
          href={getGroupPath("/lendings/new")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full",
            "text-gray-500 hover:text-[#0d47a1]",
          )}
        >
          <svg
            className={cn("w-6 h-6")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>新規作成</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className={cn("text-xs mt-1")}>新規</span>
        </Link>
      </div>
    </nav>
  );
}
