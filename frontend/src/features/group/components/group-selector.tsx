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

  // URLからgroupIdを抽出してstateにセット
  useEffect(() => {
    const match = pathname.match(/\/groups\/([^/]+)/);
    if (match) {
      setCurrentGroupId(match[1]);
    }
  }, [pathname]);

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
          "flex items-center justify-between w-full",
          "px-3 py-2.5",
          "border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
          "hover:cursor-pointer",
        )}
      >
        <div className={cn("flex items-center gap-3 flex-1 min-w-0")}>
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full",
              "bg-primary-base",
              "flex items-center justify-center",
              "text-white font-bold text-sm",
            )}
          >
            {currentGroup?.name.charAt(0) || "G"}
          </div>

          <div className={cn("flex-1 min-w-0 text-left")}>
            <SelectValue className={cn("font-medium text-gray-900 truncate block")}>
              {currentGroup?.name || "グループを選択"}
            </SelectValue>
          </div>
        </div>

        <span aria-hidden="true" className="text-gray-400">
          ▼
        </span>
      </Button>

      <Popover
        className={cn(
          "w-[--trigger-width] min-w-64",
          "mt-1",
          "rounded-md border bg-white shadow-lg",
          "entering:animate-in entering:fade-in entering:zoom-in-95",
          "exiting:animate-out exiting:fade-out exiting:zoom-out-95",
        )}
      >
        <ListBox className={cn("max-h-60 overflow-auto", "outline-none", "p-1")}>
          {groups.map((group) => (
            <ListBoxItem
              key={group.id}
              id={group.id}
              className={cn(
                "px-4 py-3",
                "flex items-center gap-3",
                "cursor-pointer outline-none rounded-md",
                "transition-colors duration-150",
                "data-[hovered]:bg-gray-100",
                "data-[focused]:outline-none",
                "data-[selected]:bg-primary-surface data-[selected]:text-primary-base",
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full",
                  "bg-primary-base",
                  "flex items-center justify-center",
                  "text-white font-bold text-sm",
                )}
              >
                {group.name.charAt(0)}
              </div>

              <div className={cn("flex-1 min-w-0")}>
                <div className={cn("font-medium text-gray-900 truncate")}>
                  {group.name}
                </div>
                <div className={cn("text-xs text-gray-500 truncate")}>
                  {group.createdBy}
                </div>
              </div>

              {group.id === currentGroupId && (
                <svg
                  className={cn("w-5 h-5 text-primary-base flex-shrink-0")}
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

        <div className={cn("border-t border-gray-200")} />

        <div className={cn("p-1")}>
          <a
            href="/groups"
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2 rounded-md",
              "text-sm font-medium text-gray-700",
              "hover:bg-gray-100 transition-colors",
            )}
          >
            <svg
              className={cn("w-4 h-4")}
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
              "text-sm font-medium text-gray-700",
              "hover:bg-gray-100 transition-colors",
            )}
          >
            <svg
              className={cn("w-4 h-4")}
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
