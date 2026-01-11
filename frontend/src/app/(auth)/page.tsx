import { getAllCredits } from "@/features/credit/actions/getAllCredits";
import { CreditList } from "@/features/credit/components/credit-list";
import { cn } from "@/utils/cn";

export default async function CreditPage() {
  const creditsResponse = await getAllCredits();

  const { success, result, error } = creditsResponse;

  return (
    <div
      className={cn("w-full max-w-4xl h-full mx-auto", "flex flex-col gap-5")}
    >
      <h1 className={cn("text-2xl font-bold")}>支払い一覧</h1>

      {error && (
        <div
          className={cn(
            "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
          )}
        >
          エラー: {error}
        </div>
      )}

      {success && result && <CreditList credits={result} />}
    </div>
  );
}
