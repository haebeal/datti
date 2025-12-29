import { getLending } from "@/features/lending/actions/getLending";
import { formatCurrency, formatDate } from "@/schema";
import Link from "next/link";
import { cn } from "@/utils/cn";

export default async function LendingDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; id: string }>;
}) {
  const { groupId, id } = await params;
  const result = await getLending(groupId, id);

  if (!result.success) {
    return <div className={cn("text-red-500")}>エラー: {result.error}</div>;
  }

  const lending = result.result;

  return (
    <div className={cn("max-w-2xl mx-auto")}>
      <div className={cn("mb-4")}>
        <Link
          href={`/groups/${groupId}/lendings`}
          className={cn("text-[#0d47a1] hover:text-[#0d47a1]")}
        >
          ← 一覧に戻る
        </Link>
      </div>

      <div className={cn("bg-white rounded-lg shadow p-6")}>
        <div className={cn("flex justify-between items-start mb-6")}>
          <div>
            <h1 className={cn("text-2xl font-bold mb-2")}>{lending.name}</h1>
            <p className={cn("text-gray-600")}>
              {formatDate(lending.eventDate)}
            </p>
          </div>
          <div className={cn("text-right")}>
            <p className={cn("text-sm text-gray-500 mb-1")}>合計金額</p>
            <p className={cn("text-3xl font-bold text-[#0d47a1]")}>
              {formatCurrency(lending.amount)}
            </p>
          </div>
        </div>

        <div className={cn("border-t pt-6")}>
          <h2 className={cn("text-lg font-semibold mb-4")}>立て替え詳細</h2>
          <div className={cn("space-y-3")}>
            {lending.debts.map((debt) => (
              <div
                key={debt.userId}
                className={cn("flex justify-between items-center py-2")}
              >
                <span className={cn("text-gray-700")}>{debt.userId}</span>
                <span className={cn("font-semibold")}>
                  {formatCurrency(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("mt-6 flex gap-2")}>
          <Link
            href={`/groups/${groupId}/lendings/${id}/edit`}
            className={cn(
              "flex-1 text-center px-4 py-2",
              "border border-[#0d47a1] text-[#0d47a1] rounded-md",
              "hover:bg-blue-50",
            )}
          >
            編集
          </Link>
        </div>
      </div>
    </div>
  );
}
