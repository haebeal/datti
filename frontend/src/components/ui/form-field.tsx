import type { ReactNode } from "react";
import { ErrorText } from "@/components/ui/error-text";
import { cn } from "@/lib/utils";

type Props = {
	/** ラベル文言 */
	label: ReactNode;
	/** 対応するコントロールの id (label の htmlFor) */
	htmlFor?: string;
	/** エラーメッセージ (なければ非表示) */
	error?: string;
	/** 必須マーク (*) を表示 */
	required?: boolean;
	className?: string;
	children: ReactNode;
};

/**
 * フォーム1項目分のラッパー (ラベル + コントロール + エラー)。
 * TanStack Form の field と組み合わせて使う。
 */
export function FormField({
	label,
	htmlFor,
	error,
	required,
	className,
	children,
}: Props) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<label htmlFor={htmlFor} className="text-xs font-medium">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</label>
			{children}
			<ErrorText>{error}</ErrorText>
		</div>
	);
}
