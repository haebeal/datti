import { getMembers } from "@/features/group/actions/getMembers";
import { LendingCreateForm } from "@/features/lending/components/lending-create-form";
import { cn } from "@/utils/cn";

export default async function CreateLendingPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const result = await getMembers(groupId);

  if (!result.success) {
    return <div className={cn("text-red-500")}>エラー: {result.error}</div>;
  }

  const members = result.result;

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>新規立て替え作成</h1>

      <LendingCreateForm groupId={groupId} members={members} />
    </div>
  );
}
