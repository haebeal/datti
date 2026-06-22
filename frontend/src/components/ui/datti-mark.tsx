type DattiMarkProps = {
	size?: number;
	className?: string;
};

/** Datti のロゴマーク。色は text-* (currentColor) で指定する。 */
export function DattiMark({ size = 28, className }: DattiMarkProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 170 170"
			className={className}
			fill="currentColor"
			role="img"
			aria-label="Datti"
		>
			<rect x="40" y="27" width="20" height="116" rx="3" />
			<path d="M50 27 L80 27 A58 58 0 0 1 80 143 L50 143 L50 123 L75 123 A38 38 0 0 0 75 47 L50 47 Z" />
			<rect x="25" y="67" width="90" height="14" rx="2" />
			<rect x="25" y="89" width="90" height="14" rx="2" />
		</svg>
	);
}
