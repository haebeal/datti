"use client";

import { use, useState, useTransition, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils";
import { LinkButton } from "@/components/ui/link-button";
import type { LendingItem, PaginatedLendingItems } from "../types";
import { getAllLendings } from "../actions/getAllLendings";

type Props = {
	groupId: string;
	initialDataPromise: Promise<PaginatedLendingItems>;
};

export function LendingList({ groupId, initialDataPromise }: Props) {
	const initialData = use(initialDataPromise);

	const [items, setItems] = useState<LendingItem[]>(initialData.items);
	const [lendingsCursor, setLendingsCursor] = useState<string | null>(
		initialData.lendingsCursor,
	);
	const [borrowingsCursor, setBorrowingsCursor] = useState<string | null>(
		initialData.borrowingsCursor,
	);
	const [hasMore, setHasMore] = useState(initialData.hasMore);
	const [isPending, startTransition] = useTransition();

	const { ref, inView } = useInView({
		threshold: 0,
		rootMargin: "100px",
	});

	const loadMore = () => {
		if (!hasMore || isPending) return;

		startTransition(async () => {
			const result = await getAllLendings(groupId, {
				lendingsCursor: lendingsCursor ?? undefined,
				borrowingsCursor: borrowingsCursor ?? undefined,
			});
			if (result.success) {
				setItems((prev) => [...prev, ...result.result.items]);
				setLendingsCursor(result.result.lendingsCursor);
				setBorrowingsCursor(result.result.borrowingsCursor);
				setHasMore(result.result.hasMore);
			}
		});
	};

	useEffect(() => {
		if (inView && hasMore && !isPending) {
			loadMore();
		}
	}, [inView, hasMore, isPending]);

	if (items.length === 0) {
		return (
			<div className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}>
				<p className={cn("text-center text-gray-500")}>
					イベントがまだありません
				</p>
				<div className={cn("flex justify-center")}>
					<LinkButton href={`/groups/${groupId}/lendings/new`}>
						新規作成
					</LinkButton>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-4")}>
			{items.map((item) => {
				const isPositive = item.amount >= 0;

				return (
					<Link
						key={`${item.type}-${item.id}`}
						href={`/groups/${groupId}/${item.type === "lending" ? "lendings" : "borrowings"}/${item.id}`}
						className={cn(
							"block p-4",
							"flex flex-col gap-2",
							"border rounded-lg",
							"hover:bg-gray-50 transition-colors",
						)}
					>
						<div className={cn("flex justify-between items-start")}>
							<div>
								<h3 className={cn("text-lg font-semibold")}>{item.name}</h3>
								<p className={cn("text-sm text-gray-600")}>{item.eventDate}</p>
							</div>
							<div className={cn("text-right")}>
								<p
									className={cn(
										"text-2xl font-bold",
										isPositive ? "text-primary-base" : "text-red-600",
									)}
								>
									{isPositive ? "+" : ""}
									{formatCurrency(item.amount)}
								</p>
								{item.type === "lending" && item.debtsCount > 0 && (
									<p className={cn("text-sm text-gray-500")}>
										{item.debtsCount}人から回収予定
									</p>
								)}
								{item.type === "borrowing" && (
									<p className={cn("text-sm text-gray-500")}>支払い予定</p>
								)}
							</div>
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
