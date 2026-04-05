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
    <div className={cn("flex flex-col gap-3")}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "p-4 bg-white border border-gray-200 rounded-xl animate-pulse",
          )}
        >
          <div className={cn("flex items-center gap-3")}>
            <div className={cn("w-10 h-10 bg-gray-200 rounded-full")} />
            <div className={cn("flex-1 space-y-2")}>
              <div className={cn("h-4 w-24 bg-gray-200 rounded")} />
              <div className={cn("h-3 w-32 bg-gray-200 rounded")} />
            </div>
            <div className={cn("space-y-2")}>
              <div className={cn("h-5 w-16 bg-gray-200 rounded")} />
              <div className={cn("h-3 w-20 bg-gray-200 rounded")} />
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
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-6")}>
      <div className={cn("flex justify-between items-center")}>
        <h1 className={cn("text-2xl lg:text-3xl font-bold text-primary-base")}>
          返した記録
        </h1>
        <LinkButton
          href="/repayments/new"
          color="accent"
          colorStyle="fill"
          className="px-6 py-2.5"
        >
          返す
        </LinkButton>
      </div>

      <Suspense fallback={<RepaymentListSkeleton />}>
        <RepaymentList initialDataPromise={initialDataPromise} />
      </Suspense>
    </div>
  );
}
