import { BorrowingCard } from "../borrowing-card";
import type { Borrowing } from "../../types";

type Props = {
	borrowings: Borrowing[];
};

export function BorrowingList({ borrowings }: Props) {
	if (borrowings.length === 0) {
		return (
			<div className="bg-white shadow rounded-lg p-8 text-center">
				<p className="text-gray-500">借り入れはありません</p>
				<p className="text-sm text-gray-400 mt-2">
					他の人から立て替えてもらった記録がここに表示されます
				</p>
			</div>
		);
	}

	const total = borrowings.reduce((sum, b) => sum + b.amount, 0);

	return (
		<div>
			<div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
				<p className="text-sm text-gray-600">借り入れ総額</p>
				<p className="text-2xl font-bold text-sky-600">
					{new Intl.NumberFormat("ja-JP", {
						style: "currency",
						currency: "JPY",
					}).format(total)}
				</p>
			</div>
			<div className="space-y-4">
				{borrowings.map((borrowing) => (
					<BorrowingCard key={borrowing.id} borrowing={borrowing} />
				))}
			</div>
		</div>
	);
}
