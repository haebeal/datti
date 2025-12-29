"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import type { Group } from "@/features/group/types";
import { cn } from "@/utils/cn";

type Props = {
  groups: Group[];
};

export function GroupSelector({ groups }: Props) {
  const pathname = usePathname();
  const params = useParams<{ groupId: string | undefined }>();
  const router = useRouter();

  // URLから現在のgroupIdを取得
  const [currentGroupId, setCurrentGroupId] = useState<string>();
  const currentGroup = groups.find((g) => g.id === currentGroupId);
  // useEffect(() => {
  //   if (params.groupId === undefined) {
  //     return;
  //   }
  //   setCurrentGroupId(params.groupId);
  //   router.push(`/groups/${params.groupId}/lendings`);
  // }, [params.groupId, router]);

  // グループページにいて、かつURLにgroupIdがない場合のみ最初のグループにリダイレクト
  // useEffect(() => {
  //   if (
  //     pathname.startsWith("/groups") &&
  //     groups.length > 0 &&
  //     currentGroupId === undefined
  //   ) {
  //     router.push(`/groups/${groups[0].id}/lendings`);
  //   }
  // }, [currentGroupId, router, pathname, groups]);

  if (groups.length === 0) {
    return (
      <div className={cn("text-sm text-gray-500 px-3 py-2")}>
        グループがありません
      </div>
    );
  }

  const handleChange = (key: React.Key | null) => {
    if (!key) return;
    const groupId = String(key);
    // 現在のパスのgroupIdを新しいgroupIdに置き換える
    if (currentGroupId) {
      const newPath = pathname.replace(
        `/groups/${currentGroupId}`,
        `/groups/${groupId}`,
      );
      router.push(newPath);
    } else {
      // groupIdがない場合はデフォルトでlendingに遷移
      router.push(`/groups/${groupId}/lendings`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Select
      value={currentGroupId}
      onChange={handleChange}
      className={cn("relative w-full")}
    >
      <Label className="sr-only">グループを選択</Label>
      <Button
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "px-4 py-3 rounded-lg",
          "bg-white border-2 border-gray-200",
          "hover:border-primary hover:bg-primary-50",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all duration-200",
          "data-[focus-visible]:border-primary data-[focus-visible]:bg-primary-50",
        )}
      >
        <div className={cn("flex items-center gap-3 flex-1 min-w-0")}>
          {/* Group Icon */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full",
              "bg-gradient-to-br from-primary to-primary-hover",
              "flex items-center justify-center",
              "text-white font-bold text-lg",
            )}
          >
            {currentGroup?.name.charAt(0) || "G"}
          </div>

          {/* Group Info */}
          <div className={cn("flex-1 min-w-0 text-left")}>
            <SelectValue
              className={cn("font-bold text-gray-900 truncate block")}
            >
              {currentGroup?.name || "グループを選択"}
            </SelectValue>
            {currentGroup && (
              <div className={cn("text-xs text-gray-500 truncate")}>
                作成: {formatDate(currentGroup.createdAt)}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={cn(
            "w-5 h-5 text-gray-500 transition-transform duration-200",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      <Popover
        className={cn(
          "entering:animate-in entering:fade-in entering:slide-in-from-top-2",
          "exiting:animate-out exiting:fade-out exiting:slide-out-to-top-2",
          "bg-white rounded-lg shadow-lg border border-gray-200",
          "max-h-96 overflow-y-auto",
        )}
      >
        <ListBox className={cn("py-2 outline-none")}>
          {groups.map((group) => (
            <ListBoxItem
              key={group.id}
              id={group.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3",
                "hover:bg-primary-50 transition-colors cursor-pointer outline-none",
                "data-focused:bg-primary-50",
                "selected:bg-primary-50",
              )}
            >
              {/* Group Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full",
                  "bg-gradient-to-br from-primary to-primary-hover",
                  "flex items-center justify-center",
                  "text-white font-bold text-lg",
                )}
              >
                {group.name.charAt(0)}
              </div>

              {/* Group Info */}
              <div className={cn("flex-1 min-w-0")}>
                <div
                  className={cn(
                    "font-bold text-gray-900 truncate flex items-center gap-2",
                  )}
                >
                  {group.name}
                  {group.id === currentGroupId && (
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        "bg-primary text-white",
                      )}
                    >
                      選択中
                    </span>
                  )}
                </div>
                <div className={cn("text-xs text-gray-500 truncate")}>
                  作成者: {group.createdBy}
                </div>
              </div>

              {/* Checkmark for selected */}
              {group.id === currentGroupId && (
                <svg
                  className={cn("w-5 h-5 text-primary shrink-0")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </ListBoxItem>
          ))}
        </ListBox>

        {/* Divider */}
        <div className={cn("border-t border-gray-200")} />

        {/* Actions */}
        <div className={cn("p-2")}>
          <a
            href="/groups"
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 rounded-md",
              "text-sm font-medium text-primary",
              "hover:bg-primary-50 transition-colors",
            )}
          >
            <svg
              className={cn("w-5 h-5")}
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
            グループを管理
          </a>
          <a
            href="/groups/new"
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 rounded-md",
              "text-sm font-medium text-primary",
              "hover:bg-primary-50 transition-colors",
            )}
          >
            <svg
              className={cn("w-5 h-5")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新しいグループを作成
          </a>
        </div>
      </Popover>
    </Select>
  );
}
