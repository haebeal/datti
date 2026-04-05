import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

  const members = membersResult.result;
  const currentUserId = meResult.user.id;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-6")}>
      <div className={cn("hidden sm:flex items-center gap-3")}>
        <Link
          href={`/groups/${groupId}/lendings`}
          className={cn("p-2 -ml-2 rounded-md", "hover:bg-transparent")}
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </Link>
        <h1 className={cn("text-3xl font-bold text-primary-base")}>
          立て替えを追加
        </h1>
      </div>

      <LendingCreateForm
        groupId={groupId}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
