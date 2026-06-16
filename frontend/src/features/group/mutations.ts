import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import { groupKeys } from "./queries";
import type { CreateGroupInput, UpdateGroupInput } from "./schema";

export function useCreateGroup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: CreateGroupInput) => {
			const { data, error } = await apiClient.POST("/groups", { body: input });
			if (error || !data) throw new Error("グループの作成に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.all });
		},
	});
}

export function useUpdateGroup(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: UpdateGroupInput) => {
			const { data, error } = await apiClient.PUT("/groups/{id}", {
				params: { path: { id } },
				body: input,
			});
			if (error || !data) throw new Error("グループの更新に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.all });
		},
	});
}

export function useDeleteGroup() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await apiClient.DELETE("/groups/{id}", {
				params: { path: { id } },
			});
			if (error) throw new Error("グループの削除に失敗しました");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.all });
		},
	});
}

export function useAddMember(groupId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (userId: string) => {
			const { error } = await apiClient.POST("/groups/{id}/members", {
				params: { path: { id: groupId } },
				body: { userId },
			});
			if (error) throw new Error("メンバー追加に失敗しました");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
		},
	});
}

export function useRemoveMember(groupId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (userId: string) => {
			const { error } = await apiClient.DELETE("/groups/{id}/members/{userId}", {
				params: { path: { id: groupId, userId } },
			});
			if (error) throw new Error("メンバー削除に失敗しました");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
		},
	});
}

export function useSearchUserByEmail() {
	return useMutation({
		mutationFn: async (
			email: string,
		): Promise<{ id: string; name: string; email: string } | null> => {
			const { data, error } = await apiClient.GET("/users", {
				params: { query: { email, limit: 1 } },
			});
			if (error || !data || data.length === 0) return null;
			return { id: data[0].id, name: data[0].name, email: data[0].email };
		},
	});
}
