import { getAllCredits } from "@/features/credit/actions/getAllCredits";
import { CreditList } from "@/features/credit/components/credit-list";

export default async function CreditPage() {
	const { success, result, error } = await getAllCredits();

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">債権一覧</h1>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					エラー: {error}
				</div>
			)}

			{success && result && <CreditList credits={result} />}
		</div>
	);
}
