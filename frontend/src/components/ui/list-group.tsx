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

type ListRowProps = Omit<React.ComponentProps<"div">, "onClick"> & {
	/** 最終行 (下罫線を消す) */
	last?: boolean;
	/** 指定すると押下可能な行 (button) になる */
	onClick?: React.MouseEventHandler<HTMLElement>;
};

const rowClass = (last: boolean | undefined, className: string | undefined) =>
	cn(
		"flex items-center gap-3 px-4 py-3.5 transition-colors",
		!last && "border-b border-hair",
		className,
	);

/** ListGroup 内の1行。onClick があれば押下可能な行 (button) として描画する。 */
export function ListRow({
	className,
	children,
	last,
	onClick,
	...props
}: ListRowProps) {
	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={cn(
					rowClass(last, className),
					"w-full cursor-pointer text-left hover:bg-secondary",
				)}
				{...(props as React.ComponentProps<"button">)}
			>
				{children}
			</button>
		);
	}

	return (
		<div className={rowClass(last, className)} {...props}>
			{children}
		</div>
	);
}
