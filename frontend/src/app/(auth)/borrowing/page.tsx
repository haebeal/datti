import { getAllBorrowings } from "@/features/borrowing/actions/getAllBorrowings";
import { BorrowingList } from "@/features/borrowing/components/borrowing-list";

export default async function BorrowingPage() {
	const { success, result, error } = await getAllBorrowings();

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">借り入れ一覧</h1>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
					エラー: {error}
				</div>
			)}

			{success && result && <BorrowingList borrowings={result} />}
		</div>
	);
}
