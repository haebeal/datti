"use client";

import { Button as AriaButton, type ButtonProps } from "react-aria-components";
import { cn } from "@/utils/cn";

type Color = "primary" | "error";
type Props = ButtonProps & {
  colorStyle?: "outline" | "fill";
  color?: Color;
};

export function Button(props: Props) {
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
          return "border border-error-base hover:bg-error-base hover:text-white disabled:hover:bg-transparent disabled:hover:text-error-base text-error-base focus:ring-error-base";
        case "primary":
        default:
          return "border border-primary-base hover:bg-primary-base hover:text-white disabled:hover:bg-transparent disabled:hover:text-primary-base text-primary-base focus:ring-primary-base";
      }
    } else {
      // fill
      switch (color) {
        case "error":
          return "border border-error-base bg-error-base hover:bg-transparent hover:text-error-base hover:ring-error-base disabled:hover:bg-error-base disabled:hover:text-white disabled:hover:ring-transparent active:bg-error-active text-white focus:ring-error-base";
        case "primary":
        default:
          return "border border-primary-base bg-primary-base hover:bg-transparent hover:text-primary-base hover:ring-primary-base disabled:hover:bg-primary-base disabled:hover:text-white disabled:hover:ring-transparent active:bg-primary-active text-white focus:ring-primary-base";
      }
    }
  };

  return (
    <AriaButton
      className={cn(
        "px-4 py-2",
        "rounded-md",
        getColorClasses(),
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:cursor-pointer",
        "transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-4",
        className,
      )}
      {...rest}
    >
      {children}
    </AriaButton>
  );
}
