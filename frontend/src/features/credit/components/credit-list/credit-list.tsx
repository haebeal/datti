import { CreditCard } from "../credit-card";
import type { Credit } from "../../types";

type Props = {
	credits: Credit[];
};

export function CreditList({ credits }: Props) {
	if (credits.length === 0) {
		return (
			<div className="bg-white shadow rounded-lg p-8 text-center">
				<p className="text-gray-500">債権はありません</p>
				<p className="text-sm text-gray-400 mt-2">
					他の人に貸している金額がここに表示されます
				</p>
			</div>
		);
	}

	const total = credits.reduce((sum, c) => sum + c.amount, 0);

	return (
		<div>
			<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
				<p className="text-sm text-gray-600">債権総額</p>
				<p className="text-2xl font-bold text-green-600">
					{new Intl.NumberFormat("ja-JP", {
						style: "currency",
						currency: "JPY",
					}).format(total)}
				</p>
			</div>
			<div className="space-y-4">
				{credits.map((credit) => (
					<CreditCard key={credit.userId} credit={credit} />
				))}
			</div>
		</div>
	);
}
