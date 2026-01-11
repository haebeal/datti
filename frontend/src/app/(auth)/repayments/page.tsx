import { Suspense } from "react";
import { getAllRepayments } from "@/features/repayment/actions/getAllRepayments";
import { RepaymentList } from "@/features/repayment/components/repayment-list";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

async function getInitialData() {
  const result = await getAllRepayments();

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.result;
}

function RepaymentListSkeleton() {
  return (
    <div className={cn("flex flex-col gap-4")}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className={cn("p-4 border rounded-lg animate-pulse")}>
          <div className={cn("flex justify-between items-start")}>
            <div className={cn("space-y-2")}>
              <div className={cn("h-5 w-32 bg-gray-200 rounded")} />
              <div className={cn("h-4 w-24 bg-gray-200 rounded")} />
            </div>
            <div className={cn("text-right space-y-2")}>
              <div className={cn("h-7 w-20 bg-gray-200 rounded")} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RepaymentsPage() {
  const initialDataPromise = getInitialData();

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <h1 className={cn("text-2xl font-bold")}>返済一覧</h1>
        <LinkButton href="/repayments/new">新規返済</LinkButton>
      </div>

      <Suspense fallback={<RepaymentListSkeleton />}>
        <RepaymentList initialDataPromise={initialDataPromise} />
      </Suspense>
    </div>
  );
}
