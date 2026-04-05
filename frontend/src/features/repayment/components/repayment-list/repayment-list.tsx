"use client";

import { use, useState, useTransition, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { CircleDollarSign } from "lucide-react";
import { RepaymentCard } from "../repayment-card";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";
import type { Repayment, PaginatedRepayments } from "../../types";
import { getAllRepayments } from "../../actions/getAllRepayments";

type Props = {
  initialDataPromise: Promise<PaginatedRepayments>;
};

export function RepaymentList({ initialDataPromise }: Props) {
  const initialData = use(initialDataPromise);

  const [repayments, setRepayments] = useState<Repayment[]>(
    initialData.repayments,
  );
  const [cursor, setCursor] = useState<string | null>(initialData.nextCursor);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isPending, startTransition] = useTransition();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const loadMore = useCallback(() => {
    if (!hasMore || isPending) return;

    startTransition(async () => {
      const result = await getAllRepayments({
        cursor: cursor ?? undefined,
      });
      if (result.success) {
        setRepayments((prev) => [...prev, ...result.result.repayments]);
        setCursor(result.result.nextCursor);
        setHasMore(result.result.hasMore);
      }
    });
  }, [hasMore, isPending, cursor]);

  useEffect(() => {
    if (inView && hasMore && !isPending) {
      loadMore();
    }
  }, [inView, hasMore, isPending, loadMore]);

  if (repayments.length === 0) {
    return (
      <div
        className={cn(
          "flex-1",
          "flex flex-col items-center justify-center gap-4",
          "py-20",
        )}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full",
            "border-2 border-gray-200",
            "flex items-center justify-center",
          )}
        >
          <CircleDollarSign className="w-8 h-8 text-accent-base" />
        </div>
        <div className={cn("flex flex-col items-center gap-1")}>
          <p className={cn("text-base font-bold text-primary-base")}>
            返済履歴はまだありません
          </p>
          <p className={cn("text-sm text-gray-400 text-center")}>
            返済を記録すると、ここに履歴が表示されます
          </p>
        </div>
        <LinkButton
          href="/repayments/new"
          color="accent"
          colorStyle="fill"
          className="px-6 py-2.5"
        >
          返済を記録
        </LinkButton>
      </div>
    );
  }

  const sortedRepayments = [...repayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className={cn("flex flex-col gap-3")}>
      {sortedRepayments.map((repayment) => (
        <RepaymentCard key={repayment.id} repayment={repayment} />
      ))}

      {/* Sentinel element for infinite scroll */}
      <div ref={ref} className={cn("h-4")} />

      {isPending && (
        <div className={cn("flex justify-center py-4")}>
          <div
            className={cn(
              "w-6 h-6 border-2 border-primary-base border-t-transparent rounded-full animate-spin",
            )}
          />
        </div>
      )}
    </div>
  );
}
