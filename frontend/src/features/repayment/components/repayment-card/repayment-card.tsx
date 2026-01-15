import Link from "next/link";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Repayment } from "../../types";

type Props = {
  repayment: Repayment;
};

export function RepaymentCard({ repayment }: Props) {
  const payerName = repayment.payer.name;
  const debtorName = repayment.debtor.name;
  const avatarLetter = debtorName.charAt(0).toUpperCase();

  return (
    <Link
      href={`/repayments/${repayment.id}`}
      className={cn(
        "p-4",
        "flex items-center gap-5",
        "border rounded-lg",
        "hover:bg-gray-50 transition-colors",
      )}
    >
      {/* Debtor Avatar */}
      {repayment.debtor.avatar ? (
        <img
          src={repayment.debtor.avatar}
          alt={debtorName}
          className={cn("flex-shrink-0 w-12 h-12 rounded-full object-cover")}
        />
      ) : (
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full",
            "bg-gradient-to-br from-[#0d47a1] to-[#1565c0]",
            "flex items-center justify-center",
            "text-white font-bold text-xl",
          )}
        >
          {avatarLetter}
        </div>
      )}

      <div className={cn("flex-1 min-w-0")}>
        <p className={cn("text-sm text-gray-500")}>返済先</p>
        <h3 className={cn("text-lg font-semibold text-gray-900 truncate")}>
          {debtorName}
        </h3>
        <p className={cn("text-sm text-gray-500 truncate")}>
          返済者: {payerName}
        </p>
      </div>

      <div className={cn("text-right flex-shrink-0")}>
        <p className={cn("text-2xl font-bold text-primary-base")}>
          {formatCurrency(repayment.amount)}
        </p>
        <p className={cn("text-sm text-gray-500")}>
          {formatDate(repayment.createdAt)}
        </p>
      </div>
    </Link>
  );
}
