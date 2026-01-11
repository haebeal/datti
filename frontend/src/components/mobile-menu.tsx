"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDollarSign, ArrowLeftRight, Users, User } from "lucide-react";
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
          <CircleDollarSign className={cn("w-6 h-6")} />
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
          <ArrowLeftRight className={cn("w-6 h-6")} />
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
          <Users className={cn("w-6 h-6")} />
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
          <User className={cn("w-6 h-6")} />
          <span className={cn("text-xs mt-1")}>プロフィール</span>
        </Link>
      </div>
    </nav>
  );
}
