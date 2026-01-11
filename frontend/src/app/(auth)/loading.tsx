import { cn } from "@/utils/cn";

export default function AuthLoading() {
  return (
    <div className={cn("flex-1", "flex items-center justify-center")}>
      <div
        className={cn(
          "w-8 h-8 border-4 border-primary-base border-t-transparent rounded-full animate-spin",
        )}
      />
    </div>
  );
}
