import { CircleArrowDown, CircleArrowUp, Wallet } from "lucide-react";
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
        {/* もらえる金額 */}
        <div
          className={cn(
            "p-3.5 lg:p-5",
            "flex items-center gap-2.5 lg:gap-3",
            "bg-white border border-gray-200 rounded-xl",
          )}
        >
          <div
            className={cn(
              "flex-shrink-0",
              "w-7 h-7 lg:w-9 lg:h-9 rounded-full",
              "bg-[#ECFDF5]",
              "flex items-center justify-center",
            )}
          >
            <CircleArrowDown className="w-4 h-4 lg:w-5 lg:h-5 text-success-base" />
          </div>
          <div className={cn("flex flex-col gap-0.5 lg:gap-1")}>
            <p className={cn("text-[11px] lg:text-xs font-medium text-gray-500")}>
              もらえる金額
            </p>
            <p className={cn("text-base lg:text-2xl font-bold text-success-base")}>
              {formatCurrency(receivable)}
            </p>
          </div>
        </div>

        {/* 支払う金額 */}
        <div
          className={cn(
            "p-3.5 lg:p-5",
            "flex items-center gap-2.5 lg:gap-3",
            "bg-white border border-gray-200 rounded-xl",
          )}
        >
          <div
            className={cn(
              "flex-shrink-0",
              "w-7 h-7 lg:w-9 lg:h-9 rounded-full",
              "bg-[#FEF2F2]",
              "flex items-center justify-center",
            )}
          >
            <CircleArrowUp className="w-4 h-4 lg:w-5 lg:h-5 text-error-base" />
          </div>
          <div className={cn("flex flex-col gap-0.5 lg:gap-1")}>
            <p className={cn("text-[11px] lg:text-xs font-medium text-gray-500")}>
              返す金額
            </p>
            <p className={cn("text-base lg:text-2xl font-bold text-error-base")}>
              {formatCurrency(payable)}
            </p>
          </div>
        </div>

        {/* トータル */}
        <div
          className={cn(
            "hidden lg:flex",
            "p-5",
            "items-center gap-3",
            "bg-white border border-gray-200 rounded-xl",
          )}
        >
          <div
            className={cn(
              "flex-shrink-0",
              "w-9 h-9 rounded-full",
              "bg-[#F0FDF4]",
              "flex items-center justify-center",
            )}
          >
            <Wallet className="w-5 h-5 text-accent-base" />
          </div>
          <div className={cn("flex flex-col gap-1")}>
            <p className={cn("text-xs font-medium text-gray-500")}>トータル</p>
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
      </div>

      {/* 人ごとの立て替え */}
      {credits.length > 0 && (
        <div className={cn("flex flex-col gap-3")}>
          <h2 className={cn("text-base lg:text-xl font-bold text-primary-base")}>
            人ごとの立て替え
          </h2>
          <div className={cn("flex flex-col gap-3")}>
            {credits.map((credit) => (
              <CreditCard key={credit.user.id} credit={credit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
