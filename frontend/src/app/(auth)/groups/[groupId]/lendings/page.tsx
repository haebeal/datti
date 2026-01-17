import { Suspense } from "react";
import { getAllLendings } from "@/features/lending/actions/getAllLendings";
import { getGroup } from "@/features/group/actions/getGroup";
import { LendingList } from "@/features/lending/components/lending-list";
import { LinkButton } from "@/components/ui/link-button";
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
    <div className={cn("flex flex-col gap-4")}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className={cn("p-4 border rounded-lg animate-pulse")}>
          <div className={cn("flex justify-between items-start")}>
            <div className={cn("space-y-2")}>
              <div className={cn("h-5 w-32 bg-gray-200 rounded")} />
              <div className={cn("h-4 w-24 bg-gray-200 rounded")} />
            </div>
            <div className={cn("text-right space-y-2")}>
              <div className={cn("h-7 w-20 bg-gray-200 rounded")} />
              <div className={cn("h-4 w-16 bg-gray-200 rounded")} />
            </div>
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
  const groupResult = await getGroup(groupId);

  if (!groupResult.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {groupResult.error}</div>
    );
  }

  const group = groupResult.result;
  const initialDataPromise = getInitialData(groupId);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <div>
          <h1 className={cn("text-2xl font-bold")}>イベント一覧</h1>
          <p className={cn("text-base text-gray-500")}>{group.name}</p>
        </div>
        <LinkButton href={`/groups/${groupId}/lendings/new`}>
          新規作成
        </LinkButton>
      </div>

      <Suspense fallback={<LendingListSkeleton />}>
        <LendingList
          groupId={groupId}
          initialDataPromise={initialDataPromise}
        />
      </Suspense>
    </div>
  );
}
