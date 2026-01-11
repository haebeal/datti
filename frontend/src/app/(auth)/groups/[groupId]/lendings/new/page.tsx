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
  const [membersResult, meResult] = await Promise.all([
    getMembers(groupId),
    getMe(),
  ]);

  if (!membersResult.success) {
    return <div className={cn("text-red-500")}>エラー: {membersResult.error}</div>;
  }

  if (!meResult.success) {
    return <div className={cn("text-red-500")}>エラー: {meResult.error}</div>;
  }

  const members = membersResult.result;
  const currentUserId = meResult.user.id;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>新規立て替え作成</h1>

      <LendingCreateForm groupId={groupId} members={members} currentUserId={currentUserId} />
    </div>
  );
}
