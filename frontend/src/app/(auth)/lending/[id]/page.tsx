import { getLending } from "@/features/lending/actions/getLending";
import { formatCurrency, formatDate } from "@/schema";
import { MOCK_USERS } from "@/libs/api/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function LendingDetailPage({ params }: Props) {
	const { id } = await params;
	const { success, result: lending, error } = await getLending(id);

	if (error || !success || !lending) {
		return (
			<div>
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					立て替え詳細
				</h1>
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					エラー: {error || "立て替え情報が見つかりません"}
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900">立て替え詳細</h1>
				<Link href={`/lending/${id}/edit`}>
					<Button color="primary">編集</Button>
				</Link>
			</div>

			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						{lending.name}
					</h2>
					<p className="text-sm text-gray-500">
						{formatDate(lending.eventDate)}
					</p>
				</div>

				<div className="p-6 border-b border-gray-200">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600">総額</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatCurrency(lending.amount)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600">債務総額</p>
							<p className="text-2xl font-bold text-sky-600">
								{formatCurrency(
									lending.debts.reduce((sum, debt) => sum + debt.amount, 0),
								)}
							</p>
						</div>
					</div>
				</div>

				<div className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						債務者一覧
					</h3>
					<div className="space-y-3">
						{lending.debts.map((debt) => {
							const user = MOCK_USERS.find((u) => u.id === debt.userId);
							return (
								<div
									key={debt.userId}
									className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
								>
									<div>
										<p className="font-medium text-gray-900">
											{user?.displayName || debt.userId}
										</p>
										<p className="text-sm text-gray-500">{user?.email}</p>
									</div>
									<p className="text-lg font-semibold text-gray-900">
										{formatCurrency(debt.amount)}
									</p>
								</div>
							);
						})}
					</div>
				</div>

				<div className="p-6 bg-gray-50 text-sm text-gray-500">
					<p>作成日: {formatDate(lending.createdAt)}</p>
					<p>更新日: {formatDate(lending.updatedAt)}</p>
				</div>
			</div>

			<div className="mt-6">
				<Link href="/lending">
					<Button color="default">一覧に戻る</Button>
				</Link>
			</div>
		</div>
	);
}
