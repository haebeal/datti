import { cn } from "@/lib/utils";

/** グループの角丸スクエア配色 (datti-web の gColor 相当) */
export const GROUP_COLORS = ["#0017c1", "#1b7a4b", "#b25000", "#6b2fb3"];

/** index から決定的にグループ色を選ぶ */
export function groupColor(index: number): string {
	return GROUP_COLORS[((index % GROUP_COLORS.length) + GROUP_COLORS.length) % GROUP_COLORS.length];
}

type MonogramProps = {
	/** 表示する1文字 (通常はグループ名の先頭) */
	label: string;
	/** 背景色 (groupColor で取得) */
	color: string;
	className?: string;
};

/** グループを表す角丸スクエアのモノグラム。サイズは className (size-*, text-*) で。 */
export function Monogram({ label, color, className }: MonogramProps) {
	return (
		<div
			className={cn(
				"font-heading flex size-11 shrink-0 items-center justify-center rounded-[28%] text-lg font-bold text-white",
				className,
			)}
			style={{ background: color }}
		>
			{label}
		</div>
	);
}
