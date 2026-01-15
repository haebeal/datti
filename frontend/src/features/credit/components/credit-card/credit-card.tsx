import { LinkButton } from "@/components/ui/link-button";
import { formatCurrency } from "@/utils";
import { cn } from "@/utils/cn";
import type { Credit } from "../../types";

type Props = {
  credit: Credit;
};

export function CreditCard({ credit }: Props) {
  const userName = credit.user.name;
  const avatarLetter = userName.charAt(0).toUpperCase();
  const isPositive = credit.amount >= 0;
  const sign = isPositive ? "+" : "";
  const label = isPositive ? "受け取る予定" : "支払う予定";

  // 返済ボタン用のURLパラメータ（負の金額を正にして渡す）
  const repaymentUrl = `/repayments/new?debtorId=${credit.user.id}&amount=${Math.abs(credit.amount)}`;

  return (
    <div
      className={cn(
        "p-4",
        "flex flex-col gap-3",
        "md:flex-row md:items-center md:gap-5",
        "border rounded-lg",
        "hover:bg-gray-50 transition-colors",
      )}
    >
      {/* Mobile: Row 1 - Avatar + Name / PC: Avatar */}
      <div className={cn("flex items-center gap-3 md:flex-1 md:gap-5")}>
        {/* User Avatar */}
        {credit.user.avatar ? (
          <img
            src={credit.user.avatar}
            alt={userName}
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

        {/* User Info */}
        <div className={cn("flex-1 min-w-0")}>
          <h3 className={cn("text-lg font-semibold text-gray-900 truncate")}>
            {userName}
          </h3>
          <p className={cn("text-sm text-gray-500 truncate")}>
            {credit.user.email}
          </p>
        </div>
      </div>

      {/* Mobile: Row 2 - Amount + Button / PC: Amount + Button */}
      <div
        className={cn(
          "flex items-center justify-between gap-4",
          "md:flex-shrink-0 md:gap-4",
        )}
      >
        <div className={cn("text-left md:text-right")}>
          <p
            className={cn(
              "text-2xl font-bold",
              isPositive ? "text-primary-base" : "text-red-600",
            )}
          >
            {sign}
            {formatCurrency(credit.amount)}
          </p>
          <p className={cn("text-sm text-gray-500")}>{label}</p>
        </div>
        {/* 返済ボタン（負の金額の場合のみ表示、正の金額でもスペース確保） */}
        <LinkButton
          href={repaymentUrl}
          colorStyle="outline"
          color="error"
          className={cn(isPositive && "invisible")}
        >
          返済する
        </LinkButton>
      </div>
    </div>
  );
}
