import { getRepayment } from "@/features/repayment/actions/getRepayment";
import { RepaymentEditForm } from "@/features/repayment/components/repayment-edit-form";
import { RepaymentDeleteForm } from "@/features/repayment/components/repayment-delete-form";
import { cn } from "@/utils/cn";

export default async function RepaymentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repaymentResult = await getRepayment(id);

  if (!repaymentResult.success) {
    return (
      <div className={cn("text-error-base")}>エラー: {repaymentResult.error}</div>
    );
  }

  const repayment = repaymentResult.result;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>返済編集</h1>

      <RepaymentEditForm repayment={repayment} />

      <RepaymentDeleteForm repaymentId={repayment.id} />
    </div>
  );
}
