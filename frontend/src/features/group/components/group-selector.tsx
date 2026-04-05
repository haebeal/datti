"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Group } from "@/features/group/types";
import { cn } from "@/utils/cn";

type Props = {
  groups: Group[];
};

const AVATAR_COLORS = [
  "bg-primary-base",
  "bg-accent-base",
  "bg-gray-400",
  "bg-success-base",
  "bg-error-base",
];

export function GroupSelector({ groups }: Props) {
  const pathname = usePathname();

  if (groups.length === 0) {
    return (
      <div className={cn("text-sm text-gray-500 px-4 py-2")}>
        グループがありません
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1")}>
      {groups.map((group, index) => {
        const isActive = pathname.includes(`/groups/${group.id}`);
        const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

        return (
          <Link
            key={group.id}
            href={`/groups/${group.id}/lendings`}
            className={cn(
              "flex items-center gap-3",
              "px-4 py-2 rounded-lg",
              "transition-colors",
              isActive
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-500 hover:bg-gray-50",
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-full",
                colorClass,
                "flex items-center justify-center",
                "text-white font-bold text-xs",
              )}
            >
              {group.name.charAt(0)}
            </div>
            <span className="text-sm truncate">{group.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
