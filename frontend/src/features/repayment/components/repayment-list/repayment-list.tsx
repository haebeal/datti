"use client";

import { use, useState, useTransition, useEffect } from "react";
import { useInView } from "react-intersection-observer";
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

  const loadMore = () => {
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
  };

  useEffect(() => {
    if (inView && hasMore && !isPending) {
      loadMore();
    }
  }, [inView, hasMore, isPending]);

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
