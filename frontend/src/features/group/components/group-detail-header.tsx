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
        "flex items-center gap-2",
        "h-16 sm:h-auto",
      )}
    >
      <Link
        href="/groups"
        className={cn("p-1 -ml-1 cursor-pointer")}
        aria-label="戻る"
      >
        <ArrowLeft className="w-6 h-6 text-primary-base sm:text-gray-500" />
      </Link>
      <span
        className={cn(
          "text-2xl font-bold text-primary-base",
          "sm:text-3xl",
        )}
      >
        {groupName}
      </span>
      <div className="flex-1" />
      <Link
        href={`/groups/${groupId}/settings`}
        className={cn("p-1 -mr-1 cursor-pointer")}
        aria-label="設定"
      >
        <Settings className="w-6 h-6 text-primary-base sm:text-gray-500" />
      </Link>
    </div>
  );
}
