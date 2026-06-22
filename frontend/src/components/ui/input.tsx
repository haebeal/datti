import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentPropsWithRef<"input">;

export function Input(props: Props) {
	const { className, type, onBlur, ...rest } = props;

	const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (type === "number" && e.target.value) {
			const num = Number(e.target.value);
			if (!Number.isNaN(num)) {
				const normalized = String(num);
				if (normalized !== e.target.value) {
					e.target.value = normalized;
				}
			}
		}
		onBlur?.(e);
	};

	return (
		<input
			autoComplete="off"
			data-1p-ignore
			type={type}
			onBlur={handleBlur}
			{...rest}
			className={cn(
				"h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground",
				"transition-colors outline-none placeholder:text-muted-foreground",
				"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"[&::-webkit-inner-spin-button]:appearance-none",
				"[&::-webkit-outer-spin-button]:appearance-none",
				"[&[type=number]]:[-moz-appearance:textfield]",
				className,
			)}
		/>
	);
}
