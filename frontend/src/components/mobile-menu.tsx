"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ArrowLeftRight, Users, User } from "lucide-react";
import { cn } from "@/utils/cn";

export function MobileMenu() {
  const pathname = usePathname();

  const items = [
    { href: "/", icon: House, label: "ホーム", match: pathname === "/" },
    { href: "/repayments", icon: ArrowLeftRight, label: "返す", match: pathname.startsWith("/repayments") },
    { href: "/groups", icon: Users, label: "グループ", match: pathname.startsWith("/groups") },
    { href: "/profile", icon: User, label: "マイページ", match: pathname === "/profile" },
  ];

  return (
    <nav
      className={cn(
        "sm:hidden fixed bottom-0 left-0 right-0",
        "bg-white border-t border-gray-200 z-50",
      )}
    >
      <div className={cn("flex justify-around items-center h-16")}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full",
              item.match
                ? "text-accent-base font-semibold"
                : "text-gray-400",
            )}
          >
            <item.icon className={cn("w-5.5 h-5.5")} />
            <span className={cn("text-[10px]")}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
