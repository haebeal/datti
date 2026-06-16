import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import type { User } from "./types";

export const userKeys = {
	all: ["users"] as const,
	me: () => [...userKeys.all, "me"] as const,
	detail: (id: string) => [...userKeys.all, "detail", id] as const,
	search: (params: { name?: string; email?: string; limit?: number }) =>
		[...userKeys.all, "search", params] as const,
};

export const meQueryOptions = queryOptions({
	queryKey: userKeys.me(),
	queryFn: async (): Promise<User> => {
		const { data, error } = await apiClient.GET("/users/me");
		if (error || !data) {
			throw new Error("自身のユーザー情報の取得に失敗しました");
		}
		return data;
	},
});

export const userQueryOptions = (id: string) =>
	queryOptions({
		queryKey: userKeys.detail(id),
		queryFn: async (): Promise<User> => {
			const { data, error } = await apiClient.GET("/users/{id}", {
				params: { path: { id } },
			});
			if (error || !data) {
				throw new Error("ユーザー情報の取得に失敗しました");
			}
			return data;
		},
	});
