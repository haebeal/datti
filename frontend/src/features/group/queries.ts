import { queryOptions } from "@tanstack/react-query";
import type { User } from "@/features/user/types";
import { apiClient } from "@/libs/api/client";
import type { Group, GroupMember } from "./types";

export const groupKeys = {
	all: ["groups"] as const,
	lists: () => [...groupKeys.all, "list"] as const,
	detail: (id: string) => [...groupKeys.all, "detail", id] as const,
	members: (id: string) => [...groupKeys.all, "members", id] as const,
};

async function enrichWithCreator(createdBy: string): Promise<User | null> {
	const { data } = await apiClient.GET("/users/{id}", {
		params: { path: { id: createdBy } },
	});
	return data ?? null;
}

export const groupsQueryOptions = queryOptions({
	queryKey: groupKeys.lists(),
	queryFn: async (): Promise<Group[]> => {
		const { data: responses, error } = await apiClient.GET("/groups");
		if (error || !responses) {
			throw new Error("グループ一覧の取得に失敗しました");
		}
		const uniqueCreatorIds = Array.from(
			new Set(responses.map((g) => g.createdBy)),
		);
		const creators = await Promise.all(uniqueCreatorIds.map(enrichWithCreator));
		const creatorMap = new Map<string, User>();
		creators.forEach((c, i) => {
			if (c) creatorMap.set(uniqueCreatorIds[i], c);
		});
		return responses
			.map((g): Group | null => {
				const creator = creatorMap.get(g.createdBy);
				if (!creator) return null;
				return {
					id: g.id,
					name: g.name,
					creator,
					createdAt: g.createdAt,
					updatedAt: g.updatedAt,
				};
			})
			.filter((g): g is Group => g !== null);
	},
});

export const groupQueryOptions = (id: string) =>
	queryOptions({
		queryKey: groupKeys.detail(id),
		queryFn: async (): Promise<Group> => {
			const { data: response, error } = await apiClient.GET("/groups/{id}", {
				params: { path: { id } },
			});
			if (error || !response) {
				throw new Error("グループの取得に失敗しました");
			}
			const creator = await enrichWithCreator(response.createdBy);
			if (!creator) {
				throw new Error("作成者の取得に失敗しました");
			}
			return {
				id: response.id,
				name: response.name,
				creator,
				createdAt: response.createdAt,
				updatedAt: response.updatedAt,
			};
		},
	});

export const groupMembersQueryOptions = (id: string) =>
	queryOptions({
		queryKey: groupKeys.members(id),
		queryFn: async (): Promise<GroupMember[]> => {
			const { data, error } = await apiClient.GET("/groups/{id}/members", {
				params: { path: { id } },
			});
			if (error || !data) {
				throw new Error("メンバーの取得に失敗しました");
			}
			return data;
		},
	});
