import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import { authUserQueryKey } from "@/libs/auth/queries";
import { compressImage } from "./lib/compress-image";
import { userKeys } from "./queries";
import type { ProfileEditInput } from "./schema";

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: ProfileEditInput) => {
			const { data, error } = await apiClient.PUT("/users/me", {
				body: { name: input.name, avatar: input.avatar ?? "" },
			});
			if (error || !data) throw new Error("プロフィールの更新に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
			queryClient.invalidateQueries({ queryKey: authUserQueryKey });
		},
	});
}

export function useUploadAvatar() {
	return useMutation({
		mutationFn: async (file: File): Promise<string> => {
			const compressed = await compressImage(file);
			const { data: presigned, error } = await apiClient.POST(
				"/users/me/avatar/upload-url",
				{
					body: {
						contentType: "image/webp",
						contentLength: compressed.size,
					},
				},
			);
			if (error || !presigned) {
				throw new Error("署名付きURLの取得に失敗しました");
			}
			const uploadRes = await fetch(presigned.uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": "image/webp" },
				body: compressed,
			});
			if (!uploadRes.ok) {
				throw new Error("S3へのアップロードに失敗しました");
			}
			return presigned.publicUrl;
		},
	});
}

export function useLinkLine() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: { code: string; redirectUri: string }) => {
			const { data, error } = await apiClient.PUT("/users/me/line", {
				body: input,
			});
			if (error || !data) throw new Error("LINE連携に失敗しました");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
}

export function useUnlinkLine() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const { error } = await apiClient.DELETE("/users/me/line");
			if (error) throw new Error("LINE連携解除に失敗しました");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.all });
		},
	});
}
