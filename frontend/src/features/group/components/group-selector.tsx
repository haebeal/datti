"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Settings,
  Plus,
  FolderCog,
} from "lucide-react";
import type { Group } from "@/features/group/types";
import { cn } from "@/utils/cn";

type Props = {
  groups: Group[];
};

type GroupAccordionItemProps = {
  group: Group;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
};

function GroupAccordionItem({
  group,
  isExpanded,
  onToggle,
  pathname,
}: GroupAccordionItemProps) {
  const isLendingsActive = pathname.includes(`/groups/${group.id}/lendings`);
  const isSettingsActive = pathname.includes(`/groups/${group.id}/settings`);

  return (
    <div className={cn("flex flex-col")}>
      {/* グループヘッダー */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-3 w-full",
          "px-3 py-2.5 rounded-md",
          "transition-colors",
          "hover:bg-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-base",
          isExpanded && "bg-primary-surface",
        )}
      >
        {/* アイコン */}
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

        {/* グループ名 */}
        <span
          className={cn(
            "flex-1 text-left font-medium truncate",
            isExpanded ? "text-primary-base" : "text-gray-900",
          )}
        >
          {group.name}
        </span>

        {/* 展開アイコン */}
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {/* サブメニュー */}
      {isExpanded && (
        <nav className={cn("flex flex-col gap-1.5", "ml-6 mt-2 mb-1")}>
          <Link
            href={`/groups/${group.id}/lendings`}
            className={cn(
              "flex items-center gap-3",
              "px-4 py-2.5 rounded-md",
              "transition-colors",
              isLendingsActive
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <ClipboardList className="w-5 h-5" />
            <span>イベント</span>
          </Link>

          <Link
            href={`/groups/${group.id}/settings`}
            className={cn(
              "flex items-center gap-3",
              "px-4 py-2.5 rounded-md",
              "transition-colors",
              isSettingsActive
                ? "bg-primary-surface text-primary-base font-semibold"
                : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <Settings className="w-5 h-5" />
            <span>設定</span>
          </Link>
        </nav>
      )}
    </div>
  );
}

export function GroupSelector({ groups }: Props) {
  const pathname = usePathname();

  // URLから現在のgroupIdを取得
  const currentGroupId = pathname.match(/\/groups\/([^/]+)/)?.[1];

  // 展開状態を管理（現在のグループIDがあれば展開）
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(
    currentGroupId || null,
  );

  // URLが変わったら展開状態を更新
  useEffect(() => {
    if (currentGroupId) {
      setExpandedGroupId(currentGroupId);
    }
  }, [currentGroupId]);

  const handleToggle = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  if (groups.length === 0) {
    return (
      <div className={cn("flex flex-col gap-2")}>
        <div className={cn("text-sm text-gray-500 px-3 py-2")}>
          グループがありません
        </div>
        <Link
          href="/groups/new"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md",
            "text-sm font-medium text-gray-700",
            "hover:bg-gray-100 transition-colors",
          )}
        >
          <Plus className="w-4 h-4" />
          <span>グループを作成</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2")}>
      {groups.map((group) => (
        <GroupAccordionItem
          key={group.id}
          group={group}
          isExpanded={expandedGroupId === group.id}
          onToggle={() => handleToggle(group.id)}
          pathname={pathname}
        />
      ))}

      {/* グループ管理・作成リンク */}
      <div className={cn("flex flex-col gap-1 mt-2 pt-2 border-t border-gray-200")}>
        <Link
          href="/groups"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md",
            "text-sm font-medium text-gray-700",
            "hover:bg-gray-100 transition-colors",
          )}
        >
          <FolderCog className="w-4 h-4" />
          <span>グループを管理</span>
        </Link>
        <Link
          href="/groups/new"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md",
            "text-sm font-medium text-gray-700",
            "hover:bg-gray-100 transition-colors",
          )}
        >
          <Plus className="w-4 h-4" />
          <span>グループを作成</span>
        </Link>
      </div>
    </div>
  );
}
