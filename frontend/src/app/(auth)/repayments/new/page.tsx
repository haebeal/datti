import { getAllCredits } from "@/features/credit/actions/getAllCredits";
import { RepaymentCreateForm } from "@/features/repayment/components/repayment-create-form";
import { cn } from "@/utils/cn";

type Props = {
  searchParams: Promise<{ debtorId?: string; amount?: string }>;
};

export default async function RepaymentCreatePage({ searchParams }: Props) {
  const { debtorId, amount } = await searchParams;
  const creditsResponse = await getAllCredits();

  if (!creditsResponse.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {creditsResponse.error}</div>
    );
  }

  const credits = creditsResponse.result.filter((credit) => credit.amount < 0);

  // URLパラメータのamountをnumberに変換（不正値は無視）
  const parsedAmount = amount ? Number.parseInt(amount, 10) : undefined;
  const defaultAmount =
    parsedAmount && !Number.isNaN(parsedAmount) && parsedAmount > 0
      ? parsedAmount
      : undefined;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>返済を記録</h1>

      <RepaymentCreateForm
        credits={credits}
        defaultDebtorId={debtorId}
        defaultAmount={defaultAmount}
      />
    </div>
  );
}
