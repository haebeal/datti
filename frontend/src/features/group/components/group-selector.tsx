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
import { Check, Settings, Plus } from "lucide-react";
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
                  {group.creator.name}
                </div>
              </div>

              {group.id === currentGroupId && (
                <Check className={cn("w-5 h-5 text-primary-base flex-shrink-0")} />
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
            <Settings className={cn("w-4 h-4")} />
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
            <Plus className={cn("w-4 h-4")} />
            新しいグループを作成
          </a>
        </div>
      </Popover>
    </Select>
  );
}
