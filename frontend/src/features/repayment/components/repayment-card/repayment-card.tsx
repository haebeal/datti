import Image from "next/image";
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
  const avatarLetter = debtorName.charAt(0);

  return (
    <Link
      href={`/repayments/${repayment.id}`}
      className={cn(
        "p-4",
        "flex items-center gap-3",
        "bg-white border border-gray-200 rounded-xl",
        "hover:bg-gray-50 transition-colors",
      )}
    >
      {/* Debtor Avatar */}
      {repayment.debtor.avatar ? (
        <Image
          src={repayment.debtor.avatar}
          alt={debtorName}
          width={40}
          height={40}
          className={cn("flex-shrink-0 w-10 h-10 rounded-full object-cover")}
        />
      ) : (
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full",
            "bg-accent-base",
            "flex items-center justify-center",
            "text-white font-bold text-sm",
          )}
        >
          {avatarLetter}
        </div>
      )}

      {/* Info */}
      <div className={cn("flex-1 min-w-0")}>
        <p className={cn("text-xs text-gray-400")}>返済先</p>
        <p className={cn("text-base font-semibold text-primary-base truncate")}>
          {debtorName}
        </p>
        <p className={cn("text-xs text-gray-500 truncate")}>
          返済者: {payerName}
        </p>
      </div>

      {/* Amount & Date */}
      <div className={cn("text-right flex-shrink-0 flex flex-col items-end gap-0.5")}>
        <p className={cn("text-xl font-bold text-primary-base")}>
          {formatCurrency(repayment.amount)}
        </p>
        <p className={cn("text-xs text-gray-500")}>
          {formatDate(repayment.createdAt)}
        </p>
      </div>
    </Link>
  );
}
