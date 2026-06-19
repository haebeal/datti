import { cn } from "@/lib/utils";
import { signedYen, yen } from "@/utils/format";

type MoneyProps = {
	value: number;
	/** 符号 (+/−) を表示する */
	signed?: boolean;
	/** プラス→pos / マイナス→neg で着色する */
	colored?: boolean;
	className?: string;
};

/**
 * 金額表示。Noto Sans の等幅数字 (tabular-nums) で桁を揃える。
 * サイズは className (text-* / font-*) で上書きする。
 */
export function Money({
	value,
	signed = false,
	colored = false,
	className,
}: MoneyProps) {
	const color = !colored
		? "text-ink"
		: value > 0
			? "text-pos"
			: value < 0
				? "text-neg"
				: "text-muted-foreground";
	return (
		<span
			className={cn(
				"font-num font-bold tabular-nums tracking-[-0.01em] whitespace-nowrap",
				color,
				className,
			)}
		>
			{signed ? signedYen(value) : yen(value)}
		</span>
	);
}
