import { LendingCard } from "../lending-card";
import type { Lending } from "../../types";

type Props = {
	lendings: Lending[];
};

export function LendingList({ lendings }: Props) {
	if (lendings.length === 0) {
		return (
			<div className="bg-white shadow rounded-lg p-8 text-center">
				<p className="text-gray-500">立て替え記録がありません</p>
				<p className="text-sm text-gray-400 mt-2">
					「新規作成」ボタンから立て替えを記録しましょう
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{lendings.map((lending) => (
				<LendingCard key={lending.id} lending={lending} />
			))}
		</div>
	);
}
