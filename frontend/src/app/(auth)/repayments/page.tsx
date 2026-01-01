import { getAllRepayments } from "@/features/repayment/actions/getAllRepayments";
import { RepaymentList } from "@/features/repayment/components/repayment-list";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";

export default async function RepaymentsPage() {
  const repaymentsResponse = await getAllRepayments();
  const { success, result, error } = repaymentsResponse;

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <h1 className={cn("text-2xl font-bold")}>返済一覧</h1>
        <LinkButton href="/repayments/new">新規返済</LinkButton>
      </div>

      {error && (
        <div
          className={cn(
            "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
          )}
        >
          エラー: {error}
        </div>
      )}

      {success && result && <RepaymentList repayments={result} />}
    </div>
  );
}
