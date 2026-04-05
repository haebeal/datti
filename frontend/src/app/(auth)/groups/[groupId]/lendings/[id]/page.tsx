import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getGroup } from "@/features/group/actions/getGroup";
import { getMembers } from "@/features/group/actions/getMembers";
import { getLending } from "@/features/lending/actions/getLending";
import { LendingDeleteForm } from "@/features/lending/components/lending-delete-form";
import { LendingEditForm } from "@/features/lending/components/lending-edit-form";
import { getMe } from "@/features/user/actions/getMe";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDate } from "@/utils/format";

export default async function LendingDetailPage({
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
      <div className={cn("text-error-base")}>エラー: {groupResult.error}</div>
    );
  }

  if (!lendingResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {lendingResult.error}</div>
    );
  }

  if (!membersResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {membersResult.error}</div>
    );
  }

  if (!meResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {meResult.error}</div>
    );
  }

  const group = groupResult.result;
  const lending = lendingResult.result;
  const members = membersResult.result;
  const currentUserId = meResult.user.id;
  const isOwner = lending.createdBy === currentUserId;

  // ユーザーIDから名前を取得するヘルパー
  const getUserName = (userId: string) => {
    const member = members.find((m) => m.id === userId);
    return member ? member.name : userId;
  };

  return (
    <div className={cn("w-full", "flex flex-col gap-6")}>
      <div className={cn("hidden sm:flex items-center gap-3")}>
        <Link
          href={`/groups/${groupId}/lendings`}
          className={cn("p-2 -ml-2 rounded-md", "hover:bg-transparent")}
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </Link>
        <h1 className={cn("text-3xl font-bold text-primary-base")}>
          {isOwner ? "立て替えを編集" : "立て替えの詳細"}
        </h1>
      </div>

      {isOwner ? (
        <>
          <LendingEditForm
            groupId={groupId}
            lending={lending}
            members={members}
            currentUserId={currentUserId}
          />
          <LendingDeleteForm groupId={groupId} lendingId={id} />
        </>
      ) : (
        <div
          className={cn(
            "p-6 lg:p-8",
            "flex flex-col gap-5",
            "bg-white border border-gray-200 rounded-xl",
            "w-full",
          )}
        >
          <h2
            className={cn(
              "text-base lg:text-xl font-semibold text-primary-base",
            )}
          >
            {lending.name}
          </h2>
          <p className={cn("text-sm text-gray-500")}>{group.name}</p>

          <div className={cn("flex flex-col gap-1")}>
            <p className={cn("text-sm text-gray-600")}>
              日付: {formatDate(lending.eventDate)}
            </p>
            <p className={cn("text-2xl font-bold text-primary-base")}>
              合計: {formatCurrency(lending.amount)}
            </p>
          </div>

          <hr className={cn("border-gray-200")} />

          <h3 className={cn("text-sm font-semibold text-primary-base")}>
            支払い詳細
          </h3>

          <div className={cn("flex flex-col gap-2")}>
            {lending.debts.map((debt) => (
              <div
                key={debt.userId}
                className={cn(
                  "flex justify-between items-center p-3",
                  "border border-gray-200 rounded-md",
                )}
              >
                <span className={cn("font-medium")}>
                  {getUserName(debt.userId)}
                </span>
                <span className={cn("font-semibold text-primary-base")}>
                  {formatCurrency(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
