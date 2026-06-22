import { queryOptions } from "@tanstack/react-query";
import type { User } from "@/features/user/types";
import { apiClient } from "@/libs/api/client";
import type { Repayment } from "./types";

export const repaymentKeys = {
	all: ["repayments"] as const,
	list: () => [...repaymentKeys.all, "list"] as const,
	detail: (id: string) => [...repaymentKeys.all, "detail", id] as const,
};

async function fetchUser(id: string): Promise<User | null> {
	const { data } = await apiClient.GET("/users/{id}", {
		params: { path: { id } },
	});
	return data ?? null;
}

export const repaymentsQueryOptions = queryOptions({
	queryKey: repaymentKeys.list(),
	queryFn: async (): Promise<Repayment[]> => {
		const { data, error } = await apiClient.GET("/repayments");
		if (error || !data) {
			throw new Error("返済一覧の取得に失敗しました");
		}
		const userIds = new Set<string>();
		for (const r of data.repayments) {
			userIds.add(r.payerId);
			userIds.add(r.debtorId);
		}
		const ids = Array.from(userIds);
		const users = await Promise.all(ids.map(fetchUser));
		const userMap = new Map<string, User>();
		users.forEach((u, i) => {
			if (u) userMap.set(ids[i], u);
		});
		return data.repayments
			.map((r): Repayment | null => {
				const payer = userMap.get(r.payerId);
				const debtor = userMap.get(r.debtorId);
				if (!payer || !debtor) return null;
				return {
					id: r.id,
					payer,
					debtor,
					amount: r.amount,
					createdAt: r.createdAt,
					updatedAt: r.updatedAt,
				};
			})
			.filter((r): r is Repayment => r !== null);
	},
});

export const repaymentQueryOptions = (id: string) =>
	queryOptions({
		queryKey: repaymentKeys.detail(id),
		queryFn: async (): Promise<Repayment> => {
			const { data, error } = await apiClient.GET("/repayments/{id}", {
				params: { path: { id } },
			});
			if (error || !data) {
				throw new Error("返済の取得に失敗しました");
			}
			const [payer, debtor] = await Promise.all([
				fetchUser(data.payerId),
				fetchUser(data.debtorId),
			]);
			if (!payer || !debtor) {
				throw new Error("ユーザー情報の取得に失敗しました");
			}
			return {
				id: data.id,
				payer,
				debtor,
				amount: data.amount,
				createdAt: data.createdAt,
				updatedAt: data.updatedAt,
			};
		},
	});
