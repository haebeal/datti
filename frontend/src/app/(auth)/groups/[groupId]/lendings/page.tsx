import { getAllLendings } from "@/features/lending/actions/getAllLendings";
import { getAllBorrowings } from "@/features/borrowing/actions/getAllBorrowings";
import { getGroup } from "@/features/group/actions/getGroup";
import { formatCurrency, formatDate } from "@/schema";
import { LinkButton } from "@/components/ui/link-button";
import Link from "next/link";
import { cn } from "@/utils/cn";

type Transaction = {
  id: string;
  name: string;
  amount: number;
  eventDate: string;
  type: "lending" | "borrowing";
  debtsCount?: number;
};

export default async function LendingPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const [groupResult, lendingResult, borrowingResult] = await Promise.all([
    getGroup(groupId),
    getAllLendings(groupId),
    getAllBorrowings(groupId),
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

  if (!borrowingResult.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {borrowingResult.error}</div>
    );
  }

  const group = groupResult.result;
  const lendings = lendingResult.result;
  const borrowings = borrowingResult.result;

  // LendingとBorrowingを統合
  const transactions: Transaction[] = [
    ...lendings.map((lending) => ({
      id: lending.id,
      name: lending.name,
      amount: lending.debts.reduce((sum, debt) => sum + debt.amount, 0), // 徴収予定額（debtsの合計）
      eventDate: lending.eventDate,
      type: "lending" as const,
      debtsCount: lending.debts.length,
    })),
    ...borrowings.map((borrowing) => ({
      id: borrowing.id,
      name: borrowing.name,
      amount: -borrowing.amount, // 支払う必要がある額（マイナス）
      eventDate: borrowing.eventDate,
      type: "borrowing" as const,
    })),
  ].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  );

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <div>
          <h1 className={cn("text-2xl font-bold")}>立て替え一覧</h1>
          <p className={cn("text-base text-gray-500")}>{group.name}</p>
        </div>
        <LinkButton href={`/groups/${groupId}/lendings/new`}>
          新規作成
        </LinkButton>
      </div>

      {transactions.length === 0 ? (
        <div className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}>
          <p className={cn("text-center text-gray-500")}>
            立て替えがまだありません
          </p>
          <div className={cn("flex justify-center")}>
            <LinkButton href={`/groups/${groupId}/lendings/new`}>
              新規作成
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-4")}>
          {transactions.map((transaction) => {
            const isLending = transaction.type === "lending";
            const isPositive = transaction.amount >= 0;

            return (
              <Link
                key={`${transaction.type}-${transaction.id}`}
                href={
                  isLending
                    ? `/groups/${groupId}/lendings/${transaction.id}`
                    : "#"
                }
                className={cn(
                  "block p-4",
                  "flex flex-col gap-2",
                  "border rounded-lg",
                  isLending && "hover:bg-gray-50 transition-colors",
                  !isLending && "pointer-events-none opacity-60",
                )}
              >
                <div className={cn("flex justify-between items-start")}>
                  <div>
                    <h3 className={cn("text-lg font-semibold")}>
                      {transaction.name}
                    </h3>
                    <p className={cn("text-sm text-gray-600")}>
                      {formatDate(transaction.eventDate)}
                    </p>
                  </div>
                  <div className={cn("text-right")}>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        isPositive ? "text-primary-base" : "text-red-600",
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.debtsCount && (
                      <p className={cn("text-sm text-gray-500")}>
                        {transaction.debtsCount}人から回収予定
                      </p>
                    )}
                    {!isPositive && (
                      <p className={cn("text-sm text-gray-500")}>支払い予定</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
