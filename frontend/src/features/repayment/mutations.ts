import { useMutation, useQueryClient } from "@tanstack/react-query";
import { creditKeys } from "@/features/credit/queries";
import { apiClient } from "@/libs/api/client";
import { repaymentKeys } from "./queries";
import type { CreateRepaymentInput, UpdateRepaymentInput } from "./schema";

export function useCreateRepayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: CreateRepaymentInput) => {
			const { data, error } = await apiClient.POST("/repayments", {
				body: input,
			});
			if (error || !data) throw new Error("返済の登録に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: repaymentKeys.all });
			queryClient.invalidateQueries({ queryKey: creditKeys.all });
		},
	});
}

export function useUpdateRepayment(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: UpdateRepaymentInput) => {
			const { data, error } = await apiClient.PUT("/repayments/{id}", {
				params: { path: { id } },
				body: input,
			});
			if (error || !data) throw new Error("返済の更新に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: repaymentKeys.all });
			queryClient.invalidateQueries({ queryKey: creditKeys.all });
		},
	});
}

export function useDeleteRepayment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await apiClient.DELETE("/repayments/{id}", {
				params: { path: { id } },
			});
			if (error) throw new Error("返済の削除に失敗しました");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: repaymentKeys.all });
			queryClient.invalidateQueries({ queryKey: creditKeys.all });
		},
	});
}
