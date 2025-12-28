import { getLending } from "@/features/lending/actions/getLending";
import { LendingForm } from "@/features/lending/components/lending-form";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function EditLendingPage({ params }: Props) {
	const { id } = await params;
	const { success, result: lending, error } = await getLending(id);

	if (error || !success || !lending) {
		return (
			<div>
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					立て替え編集
				</h1>
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					エラー: {error || "立て替え情報が見つかりません"}
				</div>
			</div>
		);
	}

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">立て替え編集</h1>
			<div className="bg-white shadow rounded-lg p-6">
				<LendingForm mode="edit" lending={lending} />
			</div>
		</div>
	);
}
