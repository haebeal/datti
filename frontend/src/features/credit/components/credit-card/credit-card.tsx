import { formatCurrency } from "@/schema";
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

  return (
    <div
      className={cn(
        "p-4",
        "flex items-center gap-5",
        "border rounded-lg",
        "hover:bg-gray-50 transition-colors",
      )}
    >
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

      {/* Amount */}
      <div className={cn("text-right flex-shrink-0")}>
        <p className={cn("text-2xl font-bold text-primary-base")}>
          {sign}
          {formatCurrency(credit.amount)}
        </p>
        <p className={cn("text-sm text-gray-500")}>{label}</p>
      </div>
    </div>
  );
}
