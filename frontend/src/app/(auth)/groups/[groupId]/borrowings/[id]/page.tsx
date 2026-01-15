import { getBorrowing } from "@/features/borrowing/actions/getBorrowing";
import { getGroup } from "@/features/group/actions/getGroup";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export default async function BorrowingDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; id: string }>;
}) {
  const { groupId, id } = await params;
  const [groupResult, borrowingResult] = await Promise.all([
    getGroup(groupId),
    getBorrowing(groupId, id),
  ]);

  if (!groupResult.success) {
    return <div className={cn("text-red-500")}>エラー: {groupResult.error}</div>;
  }

  if (!borrowingResult.success) {
    return <div className={cn("text-red-500")}>エラー: {borrowingResult.error}</div>;
  }

  const group = groupResult.result;
  const borrowing = borrowingResult.result;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <div>
          <h1 className={cn("text-2xl font-bold")}>イベント詳細</h1>
          <p className={cn("text-base text-gray-500")}>{group.name}</p>
        </div>
      </div>

      <div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
        <h2 className={cn("text-lg font-semibold")}>{borrowing.name}</h2>

        <div className={cn("flex flex-col gap-1")}>
          <p className={cn("text-sm text-gray-600")}>
            日付: {formatDate(borrowing.eventDate)}
          </p>
          <p className={cn("text-2xl font-bold text-red-600")}>
            支払い予定: {formatCurrency(borrowing.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}
