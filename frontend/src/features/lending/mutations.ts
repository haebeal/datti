import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import { lendingKeys } from "./queries";
import type { LendingFormInput } from "./schema";

function toBody(input: LendingFormInput) {
	return {
		name: input.name,
		amount: input.amount,
		eventDate: `${input.eventDate}T00:00:00+09:00`,
		debts: input.debts,
	};
}

export function useCreateLending(groupId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: LendingFormInput) => {
			const { data, error } = await apiClient.POST("/groups/{id}/lendings", {
				params: { path: { id: groupId } },
				body: toBody(input),
			});
			if (error || !data) throw new Error("立て替えの作成に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: lendingKeys.all });
		},
	});
}

export function useUpdateLending(groupId: string, lendingId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: LendingFormInput) => {
			const { data, error } = await apiClient.PUT(
				"/groups/{id}/lendings/{lendingId}",
				{
					params: { path: { id: groupId, lendingId } },
					body: toBody(input),
				},
			);
			if (error || !data) throw new Error("立て替えの更新に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: lendingKeys.all });
		},
	});
}

export function useDeleteLending(groupId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (lendingId: string) => {
			const { error } = await apiClient.DELETE(
				"/groups/{id}/lendings/{lendingId}",
				{ params: { path: { id: groupId, lendingId } } },
			);
			if (error) throw new Error("立て替えの削除に失敗しました");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: lendingKeys.all });
		},
	});
}
