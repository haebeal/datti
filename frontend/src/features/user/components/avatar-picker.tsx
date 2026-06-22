import { useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import { cn } from "@/lib/utils";
import { useUploadAvatar } from "../mutations";

type Props = {
	currentAvatar: string;
	onAvatarChange: (url: string) => void;
};

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarPicker({ currentAvatar, onAvatarChange }: Props) {
	const [previewUrl, setPreviewUrl] = useState(currentAvatar);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const uploadAvatar = useUploadAvatar();

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setError(null);
		if (inputRef.current) inputRef.current.value = "";

		if (file.size > MAX_SIZE) {
			setError("ファイルサイズは10MB以下にしてください");
			return;
		}
		if (!ALLOWED_TYPES.includes(file.type)) {
			setError("JPG、PNG、WebP形式のみ対応しています");
			return;
		}

		try {
			const url = await uploadAvatar.mutateAsync(file);
			setPreviewUrl(url);
			onAvatarChange(url);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "アップロードに失敗しました",
			);
		}
	};

	const isUploading = uploadAvatar.isPending;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-4">
				<div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="アバター"
							className="size-full object-cover"
						/>
					) : (
						<span className="text-2xl text-muted-foreground">?</span>
					)}
				</div>
				<label
					className={cn(
						buttonVariants({ variant: "outline" }),
						"cursor-pointer",
						isUploading && "pointer-events-none opacity-50",
					)}
				>
					{isUploading ? "アップロード中…" : "画像を変更"}
					<input
						ref={inputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onChange={handleFileSelect}
						disabled={isUploading}
						className="sr-only"
					/>
				</label>
			</div>
			<ErrorText>{error}</ErrorText>
		</div>
	);
}
