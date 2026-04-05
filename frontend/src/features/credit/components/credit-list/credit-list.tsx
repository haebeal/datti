import { CreditCard } from "../credit-card";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import type { Credit } from "../../types";

type Props = {
  credits: Credit[];
};

export function CreditList({ credits }: Props) {
  const receivable = credits
    .filter((c) => c.amount > 0)
    .reduce((sum, c) => sum + c.amount, 0);
  const payable = credits
    .filter((c) => c.amount < 0)
    .reduce((sum, c) => sum + Math.abs(c.amount), 0);
  const balance = receivable - payable;

  return (
    <div className={cn("flex flex-col gap-6")}>
      {/* サマリーカード */}
      <div className={cn("grid grid-cols-2 lg:grid-cols-3 gap-4")}>
        <div
          className={cn(
            "p-5",
            "flex flex-col gap-2",
            "bg-white border border-gray-200 rounded-xl",
          )}
        >
          <p className={cn("text-xs font-medium text-gray-500")}>
            <span className="hidden lg:inline">受け取り予定</span>
            <span className="lg:hidden">受け取り</span>
          </p>
          <p className={cn("text-base lg:text-2xl font-bold text-success-base")}>
            {formatCurrency(receivable)}
          </p>
        </div>
        <div
          className={cn(
            "p-5",
            "flex flex-col gap-2",
            "bg-white border border-gray-200 rounded-xl",
          )}
        >
          <p className={cn("text-xs font-medium text-gray-500")}>
            <span className="hidden lg:inline">支払い予定</span>
            <span className="lg:hidden">支払い</span>
          </p>
          <p className={cn("text-base lg:text-2xl font-bold text-error-base")}>
            {formatCurrency(payable)}
          </p>
        </div>
        <div
          className={cn(
            "hidden lg:flex",
            "p-5",
            "flex-col gap-2",
            "bg-white border border-gray-200 rounded-xl",
          )}
        >
          <p className={cn("text-xs font-medium text-gray-500")}>差し引き</p>
          <p
            className={cn(
              "text-2xl font-bold",
              balance >= 0 ? "text-accent-base" : "text-error-base",
            )}
          >
            {balance >= 0 ? "+" : ""}
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* ユーザー別 */}
      {credits.length > 0 && (
        <div className={cn("flex flex-col gap-3")}>
          <h2 className={cn("text-base lg:text-xl font-bold text-primary-base")}>
            ユーザー別
          </h2>
          <div className={cn("flex flex-col")}>
            {credits.map((credit) => (
              <CreditCard key={credit.user.id} credit={credit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
