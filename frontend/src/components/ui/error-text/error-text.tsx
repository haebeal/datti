import { cn } from "@/utils/cn";
import type { ComponentPropsWithRef } from "react";

type Props = ComponentPropsWithRef<"p">;

export function ErrorText(props: Props) {
  const { className, children, ...rest } = props;

  if (!children) return null;

  return (
    <p
      {...rest}
      className={cn("text-sm text-red-500 mt-1", className)}
      role="alert"
    >
      {children}
    </p>
  );
}
