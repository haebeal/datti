import { Suspense } from "react";
import { getAllLendings } from "@/features/lending/actions/getAllLendings";
import { getGroup } from "@/features/group/actions/getGroup";
import { getMembers } from "@/features/group/actions/getMembers";
import { LendingList } from "@/features/lending/components/lending-list";
import { GroupDetailHeader } from "@/features/group/components/group-detail-header";
import { GroupDetailView } from "@/features/group/components/group-detail-view";
import { cn } from "@/utils/cn";

async function getInitialData(groupId: string) {
  const result = await getAllLendings(groupId);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.result;
}

function LendingListSkeleton() {
  return (
    <div className={cn("flex flex-col gap-3")}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "p-4 bg-white border border-gray-200 rounded-xl animate-pulse",
          )}
        >
          <div className={cn("flex justify-between items-center")}>
            <div className={cn("h-4 w-24 bg-gray-200 rounded")} />
            <div className={cn("h-5 w-16 bg-gray-200 rounded")} />
          </div>
          <div className={cn("flex justify-between items-center mt-2")}>
            <div className={cn("h-3 w-20 bg-gray-200 rounded")} />
            <div className={cn("h-3 w-24 bg-gray-200 rounded")} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function LendingPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const [groupResult, membersResult] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
  ]);

  if (!groupResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {groupResult.error}</div>
    );
  }

  const group = groupResult.result;
  const members = membersResult.success ? membersResult.result : [];
  const initialDataPromise = getInitialData(groupId);

  const eventList = (
    <div className={cn("flex flex-col gap-4")}>
      <h2
        className={cn(
          "hidden sm:block",
          "text-xl font-bold text-primary-base",
        )}
      >
        イベント一覧
      </h2>

      <Suspense fallback={<LendingListSkeleton />}>
        <LendingList
          groupId={groupId}
          initialDataPromise={initialDataPromise}
        />
      </Suspense>
    </div>
  );

  return (
    <div className={cn("w-full", "flex flex-col gap-2 sm:gap-4")}>
      <GroupDetailHeader groupId={groupId} groupName={group.name} />
      <GroupDetailView
        groupId={groupId}
        creatorId={group.creator.id}
        members={members}
        eventList={eventList}
      />
    </div>
  );
}
