import { getGroup } from "@/features/group/actions/getGroup";
import { getMembers } from "@/features/group/actions/getMembers";
import { getMe } from "@/features/user/actions/getMe";
import { LendingCreateForm } from "@/features/lending/components/lending-create-form";
import { cn } from "@/utils/cn";

export default async function CreateLendingPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const [groupResult, membersResult, meResult] = await Promise.all([
    getGroup(groupId),
    getMembers(groupId),
    getMe(),
  ]);

  if (!groupResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {groupResult.error}</div>
    );
  }

  if (!membersResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {membersResult.error}</div>
    );
  }

  if (!meResult.success) {
    return <div className={cn("text-error-base")}>エラー: {meResult.error}</div>;
  }

  const group = groupResult.result;
  const members = membersResult.result;
  const currentUserId = meResult.user.id;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div>
        <h1 className={cn("text-2xl font-bold")}>新規イベント作成</h1>
        <p className={cn("text-base text-gray-500")}>{group.name}</p>
      </div>

      <LendingCreateForm
        groupId={groupId}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
