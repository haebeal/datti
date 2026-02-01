import Link, { type LinkProps } from "next/link";
import { cn } from "@/utils/cn";

type Color = "primary" | "error";
type Props = Omit<LinkProps, "href"> & {
  href: string;
  colorStyle?: "outline" | "fill";
  color?: Color;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
};

export function LinkButton(props: Props) {
  const {
    colorStyle = "fill",
    color = "primary",
    className,
    children,
    external = false,
    ...rest
  } = props;

  const getColorClasses = () => {
    if (colorStyle === "outline") {
      switch (color) {
        case "error":
          return "border border-error-base hover:bg-error-base hover:text-white text-error-base focus:ring-error-base";
        default:
          return "border border-primary-base hover:bg-primary-base hover:text-white text-primary-base focus:ring-primary-base";
      }
    } else {
      // fill
      switch (color) {
        case "error":
          return "border border-error-base bg-error-base hover:bg-transparent hover:text-error-base hover:ring-error-base active:bg-error-active text-white focus:ring-error-base";
        default:
          return "border border-primary-base bg-primary-base hover:bg-transparent hover:text-primary-base hover:ring-primary-base active:bg-primary-active text-white focus:ring-primary-base";
      }
    }
  };

  const buttonClassName = cn(
    "px-4 py-2",
    "rounded-md",
    getColorClasses(),
    "transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-4",
    className,
  );

  if (external) {
    return (
      <a className={buttonClassName} href={rest.href}>
        {children}
      </a>
    );
  }

  return (
    <Link className={buttonClassName} {...rest}>
      {children}
    </Link>
  );
}
