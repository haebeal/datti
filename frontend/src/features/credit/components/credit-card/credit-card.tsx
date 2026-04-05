import Image from "next/image";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Credit } from "../../types";

type Props = {
  credit: Credit;
};

export function CreditCard({ credit }: Props) {
  const userName = credit.user.name;
  const avatarLetter = userName.charAt(0);
  const isPositive = credit.amount >= 0;
  const sign = isPositive ? "+" : "";

  return (
    <div
      className={cn(
        "p-4",
        "flex items-center gap-3",
        "bg-white border border-gray-200 rounded-xl",
      )}
    >
      {/* Avatar */}
      {credit.user.avatar ? (
        <Image
          src={credit.user.avatar}
          alt={userName}
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

      {/* User Info */}
      <div className={cn("flex-1 min-w-0")}>
        <p className={cn("text-sm font-semibold text-primary-base truncate")}>
          {userName}
        </p>
        <p className={cn("text-xs text-gray-500 truncate")}>
          {credit.user.email}
        </p>
      </div>

      {/* Amount */}
      <p
        className={cn(
          "text-base font-bold flex-shrink-0",
          isPositive ? "text-success-base" : "text-error-base",
        )}
      >
        {sign}
        {formatCurrency(credit.amount)}
      </p>
    </div>
  );
}
