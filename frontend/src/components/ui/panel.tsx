import type * as React from "react";
import { cn } from "@/lib/utils";

/** デスクトップ版の枠付きパネル (角丸16px)。 */
export function Panel({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"rounded-[16px] border border-border bg-card",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

type PanelHeadProps = {
	children: React.ReactNode;
	/** 見出し横に表示する件数 */
	count?: number;
	/** 右端のアクション要素 */
	action?: React.ReactNode;
	className?: string;
};

/** Panel の見出し行 (タイトル＋件数＋右アクション)。 */
export function PanelHead({ children, count, action, className }: PanelHeadProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-2.5 border-b border-hair px-5 py-4",
				className,
			)}
		>
			<span className="font-heading text-sm font-bold whitespace-nowrap text-foreground">
				{children}
			</span>
			{count != null && (
				<span className="font-num text-xs font-bold text-muted-foreground">
					{count}
				</span>
			)}
			<div className="flex-1" />
			{action}
		</div>
	);
}
