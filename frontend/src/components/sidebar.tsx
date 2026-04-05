"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroupSelector } from "@/features/group/components/group-selector";
import { cn } from "@/utils/cn";
import type { Group } from "@/features/group/types";
import type { User } from "@/features/user/types";
import {
  House,
  ArrowLeftRight,
  Settings,
  Plus,
} from "lucide-react";

interface SidebarProps {
  groups: Group[];
  user: User | null;
}

export function Sidebar({ groups, user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path === "/repayments") return pathname.startsWith("/repayments");
    return false;
  };

  return (
    <aside
      className={cn(
        "h-full w-80",
        "hidden",
        "sm:flex flex-col",
        "px-4 py-6",
        "bg-white",
        "border-gray-200 border-r",
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className={cn("flex items-center gap-1", "px-2 py-2 pb-6")}
      >
        <Image
          src="/logo.svg"
          alt="Datti"
          width={28}
          height={28}
          className="w-7 h-7 shrink-0"
        />
        <span className="text-2xl font-bold text-primary-base">atti</span>
      </Link>

      {/* マイページセクション */}
      <div className={cn("flex flex-col gap-1")}>
        <p
          className={cn(
            "px-2 pb-1",
            "text-xs font-semibold text-gray-400",
          )}
        >
          マイページ
        </p>
        <nav className={cn("flex flex-col gap-1")}>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3",
              "px-4 py-2.5 rounded-lg",
              "transition-colors",
              isActive("/")
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-500 hover:bg-gray-50",
            )}
          >
            <House className="w-5 h-5" />
            <span className="text-sm">ホーム</span>
          </Link>

          <Link
            href="/repayments"
            className={cn(
              "flex items-center gap-3",
              "px-4 py-2.5 rounded-lg",
              "transition-colors",
              isActive("/repayments")
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-500 hover:bg-gray-50",
            )}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span className="text-sm">返す</span>
          </Link>
        </nav>
      </div>

      {/* グループセクション */}
      <div className={cn("flex flex-col gap-1", "pt-4")}>
        <div
          className={cn(
            "flex items-center justify-between",
            "px-2 pb-1",
          )}
        >
          <span className="text-xs font-semibold text-gray-400">
            グループ
          </span>
          <Link
            href="/groups/new"
            className={cn(
              "p-0.5 rounded",
              "hover:bg-gray-100 transition-colors",
            )}
            aria-label="グループを追加"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
        <GroupSelector groups={groups} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* プロフィールセクション */}
      {user && (
        <div
          className={cn(
            "flex items-center gap-3",
            "px-2 py-4",
            "border-t border-gray-200",
          )}
        >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className={cn("w-10 h-10 rounded-full object-cover")}
              unoptimized={process.env.NODE_ENV === "development"}
            />
          ) : (
            <div
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-accent-base",
                "flex items-center justify-center",
                "text-white font-bold text-sm",
              )}
            >
              {user.name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <p className={cn("text-sm font-semibold text-primary-base truncate")}>
              {user.name}
            </p>
            <p className={cn("text-xs text-gray-500 truncate")}>
              {user.email}
            </p>
          </div>
          <Link
            href="/profile"
            className={cn(
              "p-2 rounded-md",
              "transition-colors",
              "hover:bg-gray-100",
              "flex items-center justify-center",
            )}
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      )}
    </aside>
  );
}
