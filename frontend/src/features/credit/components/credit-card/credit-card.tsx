import { formatCurrency } from "@/schema";
import { cn } from "@/utils/cn";
import type { Credit } from "../../types";
import type { User } from "@/features/user/types";

type Props = {
  credit: Credit;
  user?: User;
};

export function CreditCard({ credit, user }: Props) {
  const userName = user?.name || credit.userId;
  const avatarLetter = userName.charAt(0).toUpperCase();

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

      {/* User Info */}
      <div className={cn("flex-1 min-w-0")}>
        <h3 className={cn("text-lg font-semibold text-gray-900 truncate")}>
          {userName}
        </h3>
        <p className={cn("text-sm text-gray-500 truncate")}>{user?.email}</p>
      </div>

      {/* Amount */}
      <div className={cn("text-right flex-shrink-0")}>
        <p className={cn("text-2xl font-bold text-primary-base")}>
          +{formatCurrency(credit.amount)}
        </p>
        <p className={cn("text-sm text-gray-500")}>受け取る予定</p>
      </div>
    </div>
  );
}
