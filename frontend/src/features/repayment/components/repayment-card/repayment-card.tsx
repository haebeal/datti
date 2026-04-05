import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Repayment } from "../../types";

type Props = {
  repayment: Repayment;
};

export function RepaymentCard({ repayment }: Props) {
  const payerName = repayment.payer.name;
  const debtorName = repayment.debtor.name;

  return (
    <Link
      href={`/repayments/${repayment.id}`}
      className={cn(
        "p-4 lg:p-5",
        "flex items-center gap-3 lg:gap-4",
        "bg-white border border-gray-200 rounded-xl",
        "hover:bg-gray-50 transition-colors",
      )}
    >
      {/* Check Icon */}
      <div
        className={cn(
          "flex-shrink-0",
          "w-9 h-9 lg:w-10 lg:h-10",
          "rounded-full",
          "bg-[#ECFDF5]",
          "flex items-center justify-center",
        )}
      >
        <CircleCheck className="w-5 h-5 lg:w-5.5 lg:h-5.5 text-accent-base" />
      </div>

      {/* Info */}
      <div className={cn("flex-1 min-w-0 flex flex-col gap-0.5")}>
        <p className={cn("text-xs font-semibold text-accent-base")}>記録済み</p>
        <p className={cn("text-sm font-semibold text-primary-base truncate")}>
          {payerName} → {debtorName}
        </p>
        <p className={cn("text-xs text-gray-400")}>
          {formatDate(repayment.createdAt)}
        </p>
      </div>

      {/* Amount */}
      <p className={cn("text-xl font-bold text-primary-base flex-shrink-0")}>
        {formatCurrency(repayment.amount)}
      </p>
    </Link>
  );
}
