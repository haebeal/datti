import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import type { User } from "@/features/user/types";
import type { Credit } from "./types";

export const creditKeys = {
	all: ["credits"] as const,
	list: (orderBy: "asc" | "desc" = "asc") =>
		[...creditKeys.all, "list", orderBy] as const,
};

export const creditsQueryOptions = (orderBy: "asc" | "desc" = "asc") =>
	queryOptions({
		queryKey: creditKeys.list(orderBy),
		queryFn: async (): Promise<Credit[]> => {
			const { data, error } = await apiClient.GET("/credits", {
				params: { query: { order_by: orderBy } },
			});
			if (error || !data) {
				throw new Error("債権一覧の取得に失敗しました");
			}
			const uniqueIds = Array.from(new Set(data.map((c) => c.userId)));
			const users = await Promise.all(
				uniqueIds.map((id) =>
					apiClient.GET("/users/{id}", { params: { path: { id } } }),
				),
			);
			const userMap = new Map<string, User>();
			users.forEach((u, i) => {
				if (u.data) userMap.set(uniqueIds[i], u.data);
			});
			return data
				.map((c): Credit | null => {
					const user = userMap.get(c.userId);
					if (!user) return null;
					return { user, amount: c.amount };
				})
				.filter((c): c is Credit => c !== null);
		},
	});
