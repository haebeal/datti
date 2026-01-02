import { RepaymentCard } from "../repayment-card";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";
import type { Repayment } from "../../types";

type Props = {
  repayments: Repayment[];
};

export function RepaymentList({ repayments }: Props) {
  if (repayments.length === 0) {
    return (
      <div className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}>
        <p className={cn("text-center text-gray-500")}>返済がまだありません</p>
        <p className={cn("text-sm text-center text-gray-400")}>
          返済した金額がここに表示されます
        </p>
        <div className={cn("flex justify-center")}>
          <LinkButton href="/repayments/new">新規返済</LinkButton>
        </div>
      </div>
    );
  }

  const sortedRepayments = [...repayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className={cn("flex flex-col gap-4")}>
      {sortedRepayments.map((repayment) => (
        <RepaymentCard key={repayment.id} repayment={repayment} />
      ))}
    </div>
  );
}
