import { CreditCard } from "../credit-card";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/schema";
import type { Credit } from "../../types";
import type { User } from "@/features/user/types";

type Props = {
  credits: Credit[];
  users: User[];
};

export function CreditList({ credits, users }: Props) {
  if (credits.length === 0) {
    return (
      <div className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}>
        <p className={cn("text-center text-gray-500")}>債権はありません</p>
        <p className={cn("text-sm text-center text-gray-400")}>
          他の人に貸している金額がここに表示されます
        </p>
      </div>
    );
  }

  const total = credits.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className={cn("flex flex-col gap-5")}>
      <div className={cn("p-4", "flex flex-col gap-2", "border rounded-lg")}>
        <p className={cn("text-sm text-gray-600")}>支払い総額</p>
        <p className={cn("text-2xl font-bold text-primary-base")}>
          +{formatCurrency(total)}
        </p>
      </div>
      <div className={cn("flex flex-col gap-4")}>
        {credits.map((credit) => {
          const user = users.find((u) => u.id === credit.userId);
          return <CreditCard key={credit.userId} credit={credit} user={user} />;
        })}
      </div>
    </div>
  );
}
