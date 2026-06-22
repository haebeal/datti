import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import type { Lending } from "./types";

export const lendingKeys = {
	all: ["lendings"] as const,
	listByGroup: (groupId: string) =>
		[...lendingKeys.all, "list", groupId] as const,
	detail: (groupId: string, id: string) =>
		[...lendingKeys.all, "detail", groupId, id] as const,
};

export const lendingsByGroupQueryOptions = (groupId: string) =>
	queryOptions({
		queryKey: lendingKeys.listByGroup(groupId),
		queryFn: async () => {
			const { data, error } = await apiClient.GET("/groups/{id}/lendings", {
				params: { path: { id: groupId } },
			});
			if (error || !data) {
				throw new Error("立て替え一覧の取得に失敗しました");
			}
			return data;
		},
	});

export const lendingQueryOptions = (groupId: string, lendingId: string) =>
	queryOptions({
		queryKey: lendingKeys.detail(groupId, lendingId),
		queryFn: async (): Promise<Lending> => {
			const { data, error } = await apiClient.GET(
				"/groups/{id}/lendings/{lendingId}",
				{ params: { path: { id: groupId, lendingId } } },
			);
			if (error || !data) {
				throw new Error("立て替えの取得に失敗しました");
			}
			return data;
		},
	});
