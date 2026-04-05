import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import type { Credit } from "../../types";

type Props = {
  credit: Credit;
};

export function CreditCard({ credit }: Props) {
  const userName = credit.user.name;
  const avatarLetter = userName.charAt(0);
  const isPositive = credit.amount >= 0;
  const label = isPositive ? "もらう" : "返す";
  const absAmount = Math.abs(credit.amount);

  return (
    <div
      className={cn(
        "p-4 lg:p-5",
        "flex flex-col gap-3",
        "bg-white border border-gray-200 rounded-xl",
      )}
    >
      <div className={cn("flex items-center gap-3 lg:gap-4")}>
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

        {/* Avatar + Info */}
        <div className={cn("flex-1 min-w-0 flex items-center gap-3")}>
          {/* User Avatar */}
          {credit.user.avatar ? (
            <Image
              src={credit.user.avatar}
              alt={userName}
              width={32}
              height={32}
              className={cn("flex-shrink-0 w-8 h-8 rounded-full object-cover")}
            />
          ) : (
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full",
                "bg-accent-base",
                "flex items-center justify-center",
                "text-white font-bold text-xs",
              )}
            >
              {avatarLetter}
            </div>
          )}

          <div className={cn("flex-1 min-w-0 flex flex-col gap-0.5")}>
            <p
              className={cn(
                "text-xs lg:text-sm font-semibold",
                isPositive ? "text-success-base" : "text-error-base",
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                "text-xs lg:text-sm font-semibold text-primary-base truncate",
              )}
            >
              {userName}
            </p>
          </div>
        </div>

        {/* Amount */}
        <p
          className={cn(
            "text-sm lg:text-xl font-bold flex-shrink-0",
            isPositive ? "text-success-base" : "text-error-base",
          )}
        >
          {formatCurrency(absAmount)}
        </p>
      </div>

      {!isPositive && (
        <div className={cn("flex justify-end")}>
          <LinkButton
            href={`/repayments/new?debtorId=${credit.user.id}&amount=${absAmount}`}
            colorStyle="outline"
            color="primary"
            className={cn("px-3 py-1.5 text-xs")}
          >
            返した記録をつける
          </LinkButton>
        </div>
      )}
    </div>
  );
}
