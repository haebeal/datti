import { cn } from "@/utils/cn";
import type { ButtonProps } from "react-aria-components";
import { Button as AriaButton } from "react-aria-components";

type ButtonColors = "default" | "primary" | "error" | "blue" | "green";

const colorPallet: {
	[key in ButtonColors]: {
		text?: string;
		bgDefault: string;
		bgHover: string;
		bgActive: string;
	};
} = {
	default: {
		bgDefault: "bg-gray-100",
		bgHover: "bg-gray-200",
		bgActive: "bg-gray-300",
	},
	primary: {
		text: "text-white",
		bgDefault: "bg-sky-500",
		bgHover: "bg-sky-600",
		bgActive: "bg-sky-700",
	},
	error: {
		text: "text-white",
		bgDefault: "bg-red-500",
		bgHover: "bg-red-600",
		bgActive: "bg-red-700",
	},
	blue: {
		text: "text-white",
		bgDefault: "bg-blue-700",
		bgHover: "bg-blue-800",
		bgActive: "bg-blue-900",
	},
	green: {
		text: "text-white",
		bgDefault: "bg-green-600",
		bgHover: "bg-green-700",
		bgActive: "bg-green-800",
	},
};

type Props = ButtonProps & { color: ButtonColors };

export function Button(props: Props) {
	const { color, className, isPending, isDisabled, ...rest } = props;

	const colorClass = colorPallet[color];

	return (
		<AriaButton
			isDisabled={isDisabled}
			isPending={isPending}
			className={cn(
				"px-5 py-3",
				"rounded-lg",
				"hover:cursor-pointer disabled:cursor-not-allowed pending:cursor-not-allowed",
				!isPending && !isDisabled && `active:${colorClass.bgActive}`,
				`font-semibold ${colorClass.text ?? ""}`,
				`${colorClass.bgDefault} hover:${colorClass.bgHover} disabled:opacity-60 pending:opacity-60`,
				className,
			)}
			{...rest}
		/>
	);
}
