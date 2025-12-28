import { cn } from "@/utils/cn";
import type { ComponentPropsWithRef, HTMLInputTypeAttribute } from "react";

type InputBlockSize = "lg" | "md" | "sm";

const InputBlockSizeStyle: { [key in InputBlockSize]: string } = {
	lg: "h-14",
	md: "h-11",
	sm: "h-10",
};

type InputType = Exclude<HTMLInputTypeAttribute, "checkbox" | "submit">;

type Props = ComponentPropsWithRef<"input"> & {
	type?: InputType;
	isError?: boolean;
	blockSize?: InputBlockSize;
};

export function Input(props: Props) {
	const { className, isError, blockSize = "md", ...rest } = props;

	return (
		<input
			{...rest}
			className={cn(
				className,
				"rounded-lg bg-slate-200 px-4 py-3",
				"aria-disabled:bg-slate-100 aria-disabled:text-slate-400",
				InputBlockSizeStyle[blockSize],
				isError && "border-red-500",
			)}
		/>
	);
}
