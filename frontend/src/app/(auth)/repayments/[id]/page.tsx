import { getRepayment } from "@/features/repayment/actions/getRepayment";
import { LinkButton } from "@/components/ui/link-button";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export default async function RepaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repaymentResult = await getRepayment(id);

  if (!repaymentResult.success) {
    return (
      <div className={cn("text-red-500")}>エラー: {repaymentResult.error}</div>
    );
  }

  const repayment = repaymentResult.result;
  const payerName = repayment.payer.name;
  const debtorName = repayment.debtor.name;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <h1 className={cn("text-2xl font-bold")}>返済詳細</h1>
        <LinkButton
          href={`/repayments/${id}/edit`}
          color="primary"
          colorStyle="outline"
        >
          編集
        </LinkButton>
      </div>

      <div className={cn("p-6", "flex flex-col gap-4", "border rounded-lg")}>
        <div className={cn("flex justify-between items-start gap-6")}>
          <div className={cn("flex-1")}>
            <p className={cn("text-sm text-gray-600")}>返済者</p>
            <p className={cn("text-lg font-semibold")}>{payerName}</p>
          </div>
          <div className={cn("flex-1 text-right")}>
            <p className={cn("text-sm text-gray-600")}>返済先</p>
            <p className={cn("text-lg font-semibold")}>{debtorName}</p>
          </div>
        </div>

        <hr />

        <div className={cn("flex justify-between items-center")}>
          <div>
            <p className={cn("text-sm text-gray-600")}>作成日</p>
            <p className={cn("font-medium")}>{formatDate(repayment.createdAt)}</p>
          </div>
          <div className={cn("text-right")}>
            <p className={cn("text-sm text-gray-600")}>更新日</p>
            <p className={cn("font-medium")}>{formatDate(repayment.updatedAt)}</p>
          </div>
        </div>

        <div className={cn("text-right")}>
          <p className={cn("text-sm text-gray-600")}>返済金額</p>
          <p className={cn("text-2xl font-bold text-primary-base")}>
            {formatCurrency(repayment.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}
