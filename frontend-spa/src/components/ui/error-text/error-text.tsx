import type { ComponentPropsWithRef } from "react";
import { cn } from "@/utils/cn";

type Props = ComponentPropsWithRef<"p">;

export function ErrorText(props: Props) {
	const { className, children, ...rest } = props;

	if (!children) return null;

	return (
		<p
			{...rest}
			className={cn("text-sm text-error-base mt-1", className)}
			role="alert"
		>
			{children}
		</p>
	);
}
