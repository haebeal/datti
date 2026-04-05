"use client";

import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { cn } from "@/utils/cn";
import type { GroupMember } from "../types";
import { MemberPanel } from "./member-panel";

type Props = {
  groupId: string;
  creatorId: string;
  currentUserId: string;
  members: GroupMember[];
  eventList: React.ReactNode;
};

export function GroupDetailView({ groupId, creatorId, currentUserId, members, eventList }: Props) {
  return (
    <>
      {/* モバイル: タブ切り替え */}
      <div className="sm:hidden">
        <Tabs defaultSelectedKey="events">
          <TabList
            className={cn(
              "flex",
              "border-b border-gray-200",
            )}
          >
            <Tab
              id="events"
              className={cn(
                "flex-1 flex items-center justify-center",
                "h-11",
                "text-sm cursor-pointer",
                "outline-none",
                "text-gray-400 font-medium",
                "data-[selected]:text-accent-base data-[selected]:font-semibold",
                "data-[selected]:border-b-2 data-[selected]:border-accent-base",
              )}
            >
              イベント
            </Tab>
            <Tab
              id="members"
              className={cn(
                "flex-1 flex items-center justify-center",
                "h-11",
                "text-sm cursor-pointer",
                "outline-none",
                "text-gray-400 font-medium",
                "data-[selected]:text-accent-base data-[selected]:font-semibold",
                "data-[selected]:border-b-2 data-[selected]:border-accent-base",
              )}
            >
              メンバー
            </Tab>
          </TabList>
          <TabPanel id="events" className="pt-4">
            {eventList}
          </TabPanel>
          <TabPanel id="members" className="pt-4">
            <MemberPanel groupId={groupId} members={members} creatorId={creatorId} currentUserId={currentUserId} />
          </TabPanel>
        </Tabs>
      </div>

      {/* デスクトップ: 横並び */}
      <div className={cn("hidden sm:flex gap-6")}>
        <div className="w-2/3 min-w-0">
          {eventList}
        </div>
        <div className="w-1/3">
          <MemberPanel groupId={groupId} members={members} creatorId={creatorId} currentUserId={currentUserId} />
        </div>
      </div>
    </>
  );
}
