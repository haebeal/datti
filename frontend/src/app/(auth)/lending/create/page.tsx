import { LendingForm } from "@/features/lending/components/lending-form";

export default function CreateLendingPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				立て替え作成
			</h1>
			<div className="bg-white shadow rounded-lg p-6">
				<LendingForm mode="create" />
			</div>
		</div>
	);
}
