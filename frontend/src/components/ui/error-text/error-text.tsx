import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentPropsWithRef<"p">;

export function ErrorText(props: Props) {
	const { className, children, ...rest } = props;

	if (!children) return null;

	return (
		<p
			{...rest}
			className={cn("text-sm text-destructive mt-1", className)}
			role="alert"
		>
			{children}
		</p>
	);
}
