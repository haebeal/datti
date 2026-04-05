"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import type { GroupMember } from "../types";
import { MemberPanel } from "./member-panel";

type Props = {
  creatorId: string;
  members: GroupMember[];
  eventList: React.ReactNode;
};

export function GroupDetailView({ creatorId, members, eventList }: Props) {
  const [activeTab, setActiveTab] = useState<"events" | "members">("events");

  return (
    <>
      {/* モバイルタブバー */}
      <div
        className={cn(
          "flex sm:hidden",
          "bg-white",
          "border-b border-gray-200",
          "-mx-4 -mt-5",
        )}
      >
        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={cn(
            "flex-1 flex items-center justify-center",
            "h-11",
            "text-sm",
            "transition-colors",
            activeTab === "events"
              ? "text-accent-base font-semibold border-b-2 border-accent-base"
              : "text-gray-400 font-medium",
          )}
        >
          イベント
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex-1 flex items-center justify-center",
            "h-11",
            "text-sm",
            "transition-colors",
            activeTab === "members"
              ? "text-accent-base font-semibold border-b-2 border-accent-base"
              : "text-gray-400 font-medium",
          )}
        >
          メンバー
        </button>
      </div>

      {/* コンテンツ */}
      <div className={cn("flex gap-6", "mt-4 sm:mt-0")}>
        {/* イベント一覧 */}
        <div
          className={cn(
            "flex-1 min-w-0",
            activeTab !== "events" && "hidden sm:block",
          )}
        >
          {eventList}
        </div>

        {/* メンバーパネル */}
        <div
          className={cn(
            "sm:w-80 sm:flex-shrink-0",
            activeTab !== "members" && "hidden sm:block",
          )}
        >
          <MemberPanel members={members} creatorId={creatorId} />
        </div>
      </div>
    </>
  );
}
