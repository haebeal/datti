import type { ComponentPropsWithRef } from "react";
import { cn } from "@/utils/cn";

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
				"px-3 py-2",
				"border rounded-md",
				"focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				"[&::-webkit-inner-spin-button]:appearance-none",
				"[&::-webkit-outer-spin-button]:appearance-none",
				"[&[type=number]]:[-moz-appearance:textfield]",
				className,
			)}
		/>
	);
}
