import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className={cn("text-error-base")}>エラー: {creditsResponse.error}</div>
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
    <div className={cn("w-full", "flex flex-col gap-6")}>
      <div className={cn("hidden sm:flex items-center gap-3")}>
        <Link
          href="/repayments"
          className={cn("p-2 -ml-2 rounded-md", "hover:bg-transparent")}
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </Link>
        <h1 className={cn("text-3xl font-bold text-primary-base")}>
          返した記録をつける
        </h1>
      </div>

      <RepaymentCreateForm
        credits={credits}
        defaultDebtorId={debtorId}
        defaultAmount={defaultAmount}
      />
    </div>
  );
}
