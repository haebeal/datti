import { getLending } from "@/features/lending/actions/getLending";
import { getGroup } from "@/features/group/actions/getGroup";
import { getMembers } from "@/features/group/actions/getMembers";
import { getMe } from "@/features/user/actions/getMe";
import { LendingEditForm } from "@/features/lending/components/lending-edit-form";
import { cn } from "@/utils/cn";

export default async function EditLendingPage({
  params,
}: {
  params: Promise<{ groupId: string; id: string }>;
}) {
  const { groupId, id } = await params;
  const [groupResult, lendingResult, membersResult, meResult] =
    await Promise.all([
      getGroup(groupId),
      getLending(groupId, id),
      getMembers(groupId),
      getMe(),
    ]);

  if (!groupResult.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {groupResult.error}</div>
    );
  }

  if (!lendingResult.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {lendingResult.error}</div>
    );
  }

  if (!membersResult.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {membersResult.error}</div>
    );
  }

  if (!meResult.success) {
    return <div className={cn("text-red-500")}>エラー: {meResult.error}</div>;
  }

  const group = groupResult.result;
  const lending = lendingResult.result;
  const members = membersResult.result;
  const currentUserId = meResult.user.id;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div>
        <h1 className={cn("text-2xl font-bold")}>イベント編集</h1>
        <p className={cn("text-base text-gray-500")}>{group.name}</p>
      </div>

      <LendingEditForm
        groupId={groupId}
        lending={lending}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
