"use client";

import { CalendarX } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState, useTransition } from "react";
import { useInView } from "react-intersection-observer";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";
import { getAllLendings } from "../actions/getAllLendings";
import type { LendingItem, PaginatedLendingItems } from "../types";

type Props = {
  groupId: string;
  initialDataPromise: Promise<PaginatedLendingItems>;
};

export function LendingList({ groupId, initialDataPromise }: Props) {
  const initialData = use(initialDataPromise);

  const [items, setItems] = useState<LendingItem[]>(initialData.items);
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
      const result = await getAllLendings(groupId, {
        cursor: cursor ?? undefined,
      });
      if (result.success) {
        setItems((prev) => [...prev, ...result.result.items]);
        setCursor(result.result.nextCursor);
        setHasMore(result.result.hasMore);
      }
    });
  }, [hasMore, isPending, groupId, cursor]);

  useEffect(() => {
    if (inView && hasMore && !isPending) {
      loadMore();
    }
  }, [inView, hasMore, isPending, loadMore]);

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex-1",
          "flex flex-col items-center justify-center gap-4",
          "min-h-[40vh]",
        )}
      >
        <div
          className={cn(
            "w-16 h-16 lg:w-20 lg:h-20 rounded-full",
            "bg-gray-100",
            "flex items-center justify-center",
          )}
        >
          <CalendarX className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
        </div>
        <div className={cn("flex flex-col items-center gap-1")}>
          <p
            className={cn(
              "text-sm lg:text-base font-semibold text-primary-base",
            )}
          >
            まだ立て替えはありません
          </p>
          <p className={cn("text-xs lg:text-sm text-gray-500 text-center")}>
            立て替えを追加すると、ここに表示されます
          </p>
        </div>
        <LinkButton
          href={`/groups/${groupId}/lendings/new`}
          color="accent"
          colorStyle="fill"
          className="px-6 py-2.5"
        >
          + 立て替えを追加
        </LinkButton>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3")}>
      <div className={cn("flex items-center")}>
        <div className="flex-1" />
        <LinkButton
          href={`/groups/${groupId}/lendings/new`}
          color="accent"
          colorStyle="fill"
          className="px-6 py-2.5"
        >
          + 立て替えを追加
        </LinkButton>
      </div>
      {items.map((item) => {
        const isPositive = item.amount >= 0;

        return (
          <Link
            key={item.id}
            href={`/groups/${groupId}/lendings/${item.id}`}
            className={cn(
              "p-4",
              "flex flex-col gap-2",
              "bg-white border border-gray-200 rounded-xl",
              "hover:bg-gray-50 transition-colors",
            )}
          >
            {/* 上段: 名前 + 金額 */}
            <div className={cn("flex items-center justify-between")}>
              <p className={cn("text-sm font-semibold text-primary-base")}>
                {item.name}
              </p>
              <p
                className={cn(
                  "text-base font-bold",
                  isPositive ? "text-success-base" : "text-error-base",
                )}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(item.amount)}
              </p>
            </div>

            {/* 下段: 日付 + 詳細 */}
            <div className={cn("flex items-center justify-between")}>
              <p className={cn("text-xs text-gray-400")}>{item.eventDate}</p>
              <p className={cn("text-xs text-gray-500")}>
                {isPositive && item.debtsCount > 0
                  ? `${item.debtsCount}人から回収予定`
                  : !isPositive
                    ? "支払い予定"
                    : ""}
              </p>
            </div>
          </Link>
        );
      })}

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
