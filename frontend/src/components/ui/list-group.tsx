import type * as React from "react";
import { cn } from "@/lib/utils";

/** 枠線で囲んだリストコンテナ。中に ListRow を並べる。 */
export function ListGroup({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border border-border bg-card",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

type ListRowProps = React.ComponentProps<"div"> & {
	/** 最終行 (下罫線を消す) */
	last?: boolean;
};

/** ListGroup 内の1行。onClick があれば押下スタイルになる。 */
export function ListRow({
	className,
	children,
	last,
	onClick,
	...props
}: ListRowProps) {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex items-center gap-3 px-4 py-3.5 transition-colors",
				!last && "border-b border-hair",
				onClick && "cursor-pointer hover:bg-secondary",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
