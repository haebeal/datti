import Link from "next/link";
import { formatCurrency, formatDate } from "@/schema";
import type { Lending } from "../../types";

type Props = {
	lending: Lending;
};

export function LendingCard({ lending }: Props) {
	const totalDebts = lending.debts.reduce((sum, debt) => sum + debt.amount, 0);

	return (
		<Link href={`/lending/${lending.id}`}>
			<div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold text-gray-900">{lending.name}</h3>
					<span className="text-sm text-gray-500">
						{formatDate(lending.eventDate)}
					</span>
				</div>
				<div className="flex justify-between items-end">
					<div>
						<p className="text-sm text-gray-600">
							総額: {formatCurrency(lending.amount)}
						</p>
						<p className="text-sm text-gray-600">
							債務総額: {formatCurrency(totalDebts)}
						</p>
					</div>
					<div className="text-sm text-gray-500">
						{lending.debts.length}人の債務者
					</div>
				</div>
			</div>
		</Link>
	);
}
