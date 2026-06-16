import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Color = "primary" | "accent" | "error";
type Props = LinkProps & {
	colorStyle?: "outline" | "fill";
	color?: Color;
	className?: string;
	children: ReactNode;
};

export function LinkButton(props: Props) {
	const {
		colorStyle = "fill",
		color = "primary",
		className,
		children,
		...rest
	} = props;

	const getColorClasses = () => {
		if (colorStyle === "outline") {
			switch (color) {
				case "error":
					return "border border-error-base hover:bg-error-base hover:text-white text-error-base focus:ring-error-base";
				default:
					return "border border-gray-200 bg-white hover:bg-gray-50 text-primary-base focus:ring-primary-base";
			}
		}
		switch (color) {
			case "accent":
				return "border border-accent-base bg-accent-base hover:bg-accent-hover active:bg-accent-active text-white focus:ring-accent-base";
			case "error":
				return "border border-error-base bg-error-base hover:bg-error-hover hover:text-white active:bg-error-active text-white focus:ring-error-base";
			default:
				return "border border-primary-base bg-primary-base hover:bg-primary-hover active:bg-primary-active text-white focus:ring-primary-base";
		}
	};

	return (
		<Link
			className={cn(
				"px-6 py-3.5",
				"rounded-lg",
				"flex items-center justify-center gap-2.5",
				"text-sm font-semibold",
				getColorClasses(),
				"cursor-pointer",
				"transition-colors",
				"focus:outline-none focus:ring-2 focus:ring-offset-4",
				className,
			)}
			{...rest}
		>
			{children}
		</Link>
	);
}
