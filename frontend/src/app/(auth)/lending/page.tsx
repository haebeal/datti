import { getAllLendings } from "@/features/lending/actions/getAllLendings";
import { LendingList } from "@/features/lending/components/lending-list";

export default async function LendingPage() {
	const { success, result, error } = await getAllLendings();

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900">立て替え一覧</h1>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					エラー: {error}
				</div>
			)}

			{success && result && <LendingList lendings={result} />}
		</div>
	);
}
