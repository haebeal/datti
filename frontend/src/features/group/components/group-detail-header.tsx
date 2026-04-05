"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

type Props = {
  groupId: string;
  groupName: string;
};

export function GroupDetailHeader({ groupId, groupName }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        "h-14 sm:h-auto",
        "sm:mb-2",
      )}
    >
      <Link
        href="/groups"
        className={cn("p-2 -ml-2 rounded-md", "hover:bg-gray-100 sm:hover:bg-transparent")}
        aria-label="戻る"
      >
        <ArrowLeft className="w-6 h-6 text-gray-500" />
      </Link>
      <div className="flex-1 sm:hidden" />
      <span
        className={cn(
          "text-base font-semibold text-primary-base",
          "sm:text-3xl sm:font-bold",
        )}
      >
        {groupName}
      </span>
      <div className="flex-1" />
      <Link
        href={`/groups/${groupId}/settings`}
        className={cn("p-2 -mr-2 rounded-md", "hover:bg-gray-100 sm:hover:bg-transparent")}
        aria-label="設定"
      >
        <Settings className="w-6 h-6 text-primary-base sm:text-gray-500" />
      </Link>
    </div>
  );
}
