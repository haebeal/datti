"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroupSelector } from "@/features/group/components/group-selector";
import { cn } from "@/utils/cn";
import type { Group } from "@/features/group/types";
import type { User } from "@/features/user/types";
import { useTransition } from "react";
import { logout } from "@/features/auth/actions/logout";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  CircleDollarSign,
  ArrowLeftRight,
  Users,
  Settings,
} from "lucide-react";

interface SidebarProps {
  groups: Group[];
  user: User | null;
}

/**
 * ログアウトボタン
 */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Button
      type="button"
      colorStyle="outline"
      onPress={handleLogout}
      isDisabled={isPending}
    >
      {isPending ? "ログアウト中..." : "ログアウト"}
    </Button>
  );
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
        "sm:flex flex-col gap-2",
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

      {/* My Page Section */}
      <div className={cn("flex flex-col gap-3")}>
        <div className={cn("flex items-center gap-2", "px-2")}>
          <UserIcon className={cn("w-4 h-4 text-primary-base")} />
          <span className={cn("text-xs font-bold text-primary-base uppercase")}>
            マイページ
          </span>
        </div>

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
            <CircleDollarSign className="w-5 h-5" />
            <span>立て替え</span>
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
            <ArrowLeftRight className="w-5 h-5" />
            <span>返済</span>
          </Link>
        </nav>
      </div>

      <hr className={cn("border-gray-200 my-4")} />

      {/* Group Section */}
      <div className={cn("flex flex-col gap-3")}>
        <div className={cn("flex items-center gap-2", "px-2")}>
          <Users className={cn("w-4 h-4 text-primary-base")} />
          <span className={cn("text-xs font-bold text-primary-base uppercase")}>
            グループ
          </span>
        </div>

        <GroupSelector groups={groups} />
      </div>

      {/* User Section */}
      {user && (
        <>
          <div className="flex-1" />
          <hr className={cn("border-gray-200 my-4")} />
          <div className={cn("flex flex-col gap-3")}>
            <div className={cn("flex items-center gap-3", "px-2")}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={cn("w-10 h-10 rounded-full")}
                />
              ) : (
                <div
                  className={cn(
                    "w-10 h-10 rounded-full",
                    "bg-primary-surface",
                    "flex items-center justify-center",
                    "text-primary-base font-bold",
                  )}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <p className={cn("text-sm font-medium text-gray-900 truncate")}>
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
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
            <LogoutButton />
          </div>
        </>
      )}
    </aside>
  );
}
