import { formatCurrency } from "@/schema";
import { MOCK_USERS } from "@/libs/api/auth";
import type { Credit } from "../../types";

type Props = {
	credit: Credit;
};

export function CreditCard({ credit }: Props) {
	const user = MOCK_USERS.find((u) => u.id === credit.userId);
	const userName = user?.displayName || credit.userId;

	return (
		<div className="bg-white shadow rounded-lg p-4">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
					<p className="text-sm text-gray-500">{user?.email}</p>
				</div>
				<div className="text-right">
					<p className="text-xl font-bold text-green-600">
						{formatCurrency(credit.amount)}
					</p>
					<p className="text-sm text-gray-500">受け取る予定</p>
				</div>
			</div>
		</div>
	);
}
