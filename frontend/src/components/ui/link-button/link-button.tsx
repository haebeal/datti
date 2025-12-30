import Link, { type LinkProps } from "next/link";
import { cn } from "@/utils/cn";

type Color = "primary" | "error" | "gray";
type Props = LinkProps & {
  colorStyle?: "outline" | "fill";
  color?: Color;
  className?: string;
  children: React.ReactNode;
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
        case "gray":
          return "border border-gray-300 hover:bg-gray-600 hover:text-white text-gray-700 focus:ring-gray-400";
        case "primary":
        default:
          return "border border-primary-base hover:bg-primary-base hover:text-white text-primary-base focus:ring-primary-base";
      }
    } else {
      // fill
      switch (color) {
        case "error":
          return "bg-error-base hover:bg-error-hover disabled:hover:bg-error-base active:bg-error-active text-white focus:ring-error-base";
        case "gray":
          return "bg-gray-300 hover:bg-gray-400 disabled:hover:bg-gray-300 active:bg-gray-500 text-gray-700 focus:ring-gray-400";
        case "primary":
        default:
          return "bg-primary-base hover:bg-primary-hover disabled:hover:bg-primary-base active:bg-primary-active text-white focus:ring-primary-base";
      }
    }
  };

  return (
    <Link
      className={cn(
        "px-4 py-2",
        "rounded-md",
        getColorClasses(),
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
