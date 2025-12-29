import { cn } from "@/utils/cn";
import type { ComponentPropsWithRef } from "react";

type Props = ComponentPropsWithRef<"input">;

export function Input(props: Props) {
  const { className, ...rest } = props;

  return (
    <input
      autoComplete="off"
      data-1p-ignore
      {...rest}
      className={cn(
        "px-3 py-2",
        "border rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    />
  );
}
