import { getAllLendings } from "@/features/lending/actions/getAllLendings";
import { getAllBorrowings } from "@/features/borrowing/actions/getAllBorrowings";
import { formatCurrency, formatDate } from "@/schema";
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
  const [lendingResult, borrowingResult] = await Promise.all([
    getAllLendings(groupId),
    getAllBorrowings(groupId),
  ]);

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

  const lendings = lendingResult.result;
  const borrowings = borrowingResult.result;

  // LendingとBorrowingを統合
  const transactions: Transaction[] = [
    ...lendings.map((lending) => ({
      id: lending.id,
      name: lending.name,
      amount: lending.amount,
      eventDate: lending.eventDate,
      type: "lending" as const,
      debtsCount: lending.debts.length,
    })),
    ...borrowings.map((borrowing) => ({
      id: borrowing.id,
      name: borrowing.name,
      amount: -borrowing.amount, // マイナスで表現
      eventDate: borrowing.eventDate,
      type: "borrowing" as const,
    })),
  ].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  );

  if (transactions.length === 0) {
    return (
      <div className={cn("text-center py-12")}>
        <p className={cn("text-gray-500 mb-4")}>立て替えがまだありません</p>
        <Link
          href={`/groups/${groupId}/lendings/new`}
          className={cn(
            "inline-flex items-center px-4 py-2",
            "border border-transparent text-sm font-medium rounded-md",
            "text-white bg-[#0d47a1] hover:bg-[#1565c0]",
          )}
        >
          新規作成
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4")}>
      <div className={cn("flex justify-between items-center")}>
        <h1 className={cn("text-2xl font-bold")}>立て替え一覧</h1>
        <Link
          href={`/groups/${groupId}/lendings/new`}
          className={cn(
            "inline-flex items-center px-4 py-2",
            "border border-transparent text-sm font-medium rounded-md",
            "text-white bg-[#0d47a1] hover:bg-[#1565c0]",
          )}
        >
          新規作成
        </Link>
      </div>

      <div className={cn("grid gap-4")}>
        {transactions.map((transaction) => {
          const isLending = transaction.type === "lending";
          const isPositive = transaction.amount >= 0;

          return (
            <Link
              key={transaction.id}
              href={
                isLending
                  ? `/groups/${groupId}/lendings/${transaction.id}`
                  : "#"
              }
              className={cn(
                "block bg-white rounded-lg shadow p-6",
                isLending && "hover:shadow-md transition-shadow",
                !isLending && "pointer-events-none",
              )}
            >
              <div className={cn("flex justify-between items-start")}>
                <div>
                  <h3 className={cn("text-lg font-semibold mb-2")}>
                    {transaction.name}
                  </h3>
                  <p className={cn("text-gray-600 text-sm")}>
                    {formatDate(transaction.eventDate)}
                  </p>
                </div>
                <div className={cn("text-right")}>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isPositive ? "text-[#0d47a1]" : "text-red-600",
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(transaction.amount)}
                  </p>
                  {transaction.debtsCount && (
                    <p className={cn("text-sm text-gray-500")}>
                      {transaction.debtsCount}人に立て替え
                    </p>
                  )}
                  {!isPositive && (
                    <p className={cn("text-sm text-gray-500")}>支払う予定</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
