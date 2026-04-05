import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRepayment } from "@/features/repayment/actions/getRepayment";
import { RepaymentEditForm } from "@/features/repayment/components/repayment-edit-form";
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
      <div className={cn("text-error-base")}>エラー: {repaymentResult.error}</div>
    );
  }

  const repayment = repaymentResult.result;

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
          返した記録を編集
        </h1>
      </div>

      <RepaymentEditForm repayment={repayment} />
    </div>
  );
}
