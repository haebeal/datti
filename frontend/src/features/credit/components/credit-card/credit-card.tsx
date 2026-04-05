import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Credit } from "../../types";

type Props = {
  credit: Credit;
};

export function CreditCard({ credit }: Props) {
  const userName = credit.user.name;
  const isPositive = credit.amount >= 0;
  const label = isPositive ? "もらう" : "払う";

  return (
    <div
      className={cn(
        "p-4 lg:p-5",
        "flex items-center gap-3 lg:gap-4",
        "bg-white border border-gray-200 rounded-xl",
      )}
    >
      {/* Direction Icon */}
      <div
        className={cn(
          "flex-shrink-0",
          "w-8 h-8 lg:w-10 lg:h-10 rounded-full",
          isPositive ? "bg-[#ECFDF5]" : "bg-[#FEF2F2]",
          "flex items-center justify-center",
        )}
      >
        {isPositive ? (
          <CircleArrowDown className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 text-success-base" />
        ) : (
          <CircleArrowUp className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 text-error-base" />
        )}
      </div>

      {/* Info */}
      <div className={cn("flex-1 min-w-0 flex flex-col gap-0.5")}>
        <p
          className={cn(
            "text-xs font-semibold",
            isPositive ? "text-success-base" : "text-error-base",
          )}
        >
          {label}
        </p>
        <p className={cn("text-xs lg:text-sm font-semibold text-primary-base truncate")}>
          {userName}
        </p>
        <p className={cn("text-xs text-gray-400")}>
          {credit.user.email}
        </p>
      </div>

      {/* Amount */}
      <p
        className={cn(
          "text-sm lg:text-xl font-bold flex-shrink-0",
          isPositive ? "text-success-base" : "text-error-base",
        )}
      >
        {formatCurrency(Math.abs(credit.amount))}
      </p>
    </div>
  );
}
