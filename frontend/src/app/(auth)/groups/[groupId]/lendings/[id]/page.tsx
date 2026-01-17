import { getLending } from "@/features/lending/actions/getLending";
import { getGroup } from "@/features/group/actions/getGroup";
import { getMembers } from "@/features/group/actions/getMembers";
import { formatCurrency, formatDate } from "@/utils/format";
import { LinkButton } from "@/components/ui/link-button";
import { LendingDeleteForm } from "@/features/lending/components/lending-delete-form";
import { cn } from "@/utils/cn";

export default async function LendingDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; id: string }>;
}) {
  const { groupId, id } = await params;
  const [groupResult, lendingResult, membersResult] = await Promise.all([
    getGroup(groupId),
    getLending(groupId, id),
    getMembers(groupId),
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

  const group = groupResult.result;
  const lending = lendingResult.result;
  const members = membersResult.result;

  // ユーザーIDから名前を取得するヘルパー
  const getUserName = (userId: string) => {
    const member = members.find((m) => m.id === userId);
    return member ? member.name : userId;
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <div>
          <h1 className={cn("text-2xl font-bold")}>イベント詳細</h1>
          <p className={cn("text-base text-gray-500")}>{group.name}</p>
        </div>
        <LinkButton
          href={`/groups/${groupId}/lendings/${id}/edit`}
          color="primary"
          colorStyle="outline"
        >
          編集
        </LinkButton>
      </div>

      <div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
        <h2 className={cn("text-lg font-semibold")}>{lending.name}</h2>

        <div className={cn("flex flex-col gap-1")}>
          <p className={cn("text-sm text-gray-600")}>
            日付: {formatDate(lending.eventDate)}
          </p>
          <p className={cn("text-2xl font-bold text-primary-base")}>
            合計: {formatCurrency(lending.amount)}
          </p>
        </div>

        <hr />

        <h3 className={cn("text-sm font-semibold")}>支払い詳細</h3>

        <div className={cn("flex flex-col gap-2")}>
          {lending.debts.map((debt) => (
            <div
              key={debt.userId}
              className={cn(
                "flex justify-between items-center p-3",
                "border rounded-md",
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

      <LendingDeleteForm groupId={groupId} lendingId={id} />
    </div>
  );
}
