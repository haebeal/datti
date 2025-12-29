"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroupSelector } from "@/features/group/components/group-selector";
import { cn } from "@/utils/cn";
import type { Group } from "@/features/group/types";

interface SidebarProps {
  groups: Group[];
}

export function Sidebar({ groups }: SidebarProps) {
  const pathname = usePathname();
  const groupId = pathname.match(/\/groups\/([^/]+)/)?.[1];
  const firstGroupId = groups.length > 0 ? groups[0].id : null;

  const getGroupPath = (path: string) => {
    const activeGroupId = groupId || firstGroupId;
    return activeGroupId ? `/groups/${activeGroupId}${path}` : "/groups";
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path === "/repayments") return pathname.startsWith("/repayments");
    return pathname.includes(path);
  };

  return (
    <aside
      className={cn(
        "h-screen w-80",
        "flex flex-col gap-2",
        "px-5 py-6",
        "border-gray-200 border-r",
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className={cn(
          "flex items-center",
          "text-2xl font-bold text-primary-base",
          "px-3 pb-4",
        )}
      >
        Datti
      </Link>

      <hr className={cn("border-gray-200 mb-2")} />

      {/* Global Navigation */}
      <nav className={cn("flex flex-col gap-1")}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3",
            "px-4 py-3 rounded-md",
            "transition-colors",
            isActive("/")
              ? "bg-primary-surface text-primary-base font-semibold"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>支払い</span>
        </Link>

        <Link
          href="/repayments"
          className={cn(
            "flex items-center gap-3",
            "px-4 py-3 rounded-md",
            "transition-colors",
            isActive("/repayments")
              ? "bg-primary-surface text-primary-base font-semibold"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3"
            />
          </svg>
          <span>返済</span>
        </Link>
      </nav>

      <hr className={cn("border-gray-200 my-4")} />

      {/* Group Section */}
      <div className={cn("flex flex-col gap-3")}>
        <div className={cn("flex items-center gap-2", "px-2")}>
          <svg
            className={cn("w-4 h-4 text-primary-base")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className={cn("text-xs font-bold text-primary-base uppercase")}>
            グループ
          </span>
        </div>

        <GroupSelector groups={groups} />

        <nav className={cn("flex flex-col gap-1")}>
          <Link
            href={getGroupPath("/lendings")}
            className={cn(
              "flex items-center gap-3",
              "px-4 py-3 rounded-md",
              "transition-colors",
              isActive("/lendings")
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>立て替え</span>
          </Link>

          <Link
            href={getGroupPath("/settings")}
            className={cn(
              "flex items-center gap-3",
              "px-4 py-3 rounded-md",
              "transition-colors",
              isActive("/settings")
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>設定</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
