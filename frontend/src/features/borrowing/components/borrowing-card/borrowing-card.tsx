import { formatCurrency, formatDate } from "@/schema";
import type { Borrowing } from "../../types";

type Props = {
	borrowing: Borrowing;
};

export function BorrowingCard({ borrowing }: Props) {
	return (
		<div className="bg-white shadow rounded-lg p-4">
			<div className="flex justify-between items-start mb-2">
				<h3 className="text-lg font-semibold text-gray-900">{borrowing.name}</h3>
				<span className="text-sm text-gray-500">
					{formatDate(borrowing.eventDate)}
				</span>
			</div>
			<div>
				<p className="text-xl font-bold text-red-600">
					{formatCurrency(borrowing.amount)}
				</p>
				<p className="text-sm text-gray-500 mt-1">支払う必要があります</p>
			</div>
		</div>
	);
}
