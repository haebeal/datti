"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorText } from "@/components/ui/error-text";
import { MOCK_USERS } from "@/libs/api/auth";
import { createLending } from "../../actions/createLending";
import { updateLending } from "../../actions/updateLending";
import type { Lending } from "../../types";

type Props = {
	lending?: Lending;
	mode: "create" | "edit";
};

export function LendingForm({ lending, mode }: Props) {
	const router = useRouter();
	const [debts, setDebts] = useState(
		lending?.debts || [{ userId: "", amount: 0 }],
	);

	const handleSubmit = async (prevState: unknown, formData: FormData) => {
		const name = formData.get("name") as string;
		const amount = Number.parseInt(formData.get("amount") as string, 10);
		const eventDate = new Date(formData.get("eventDate") as string);

		const data = {
			name,
			amount,
			eventDate,
			debts: debts.filter((d) => d.userId && d.amount > 0),
		};

		if (mode === "edit" && lending) {
			const result = await updateLending({ ...data, id: lending.id });
			if (result.success) {
				router.push(`/lending/${lending.id}`);
			}
			return result;
		}

		const result = await createLending(data);
		if (result.success) {
			router.push("/lending");
		}
		return result;
	};

	const [state, action, isPending] = useActionState(handleSubmit, null);

	const addDebt = () => {
		setDebts([...debts, { userId: "", amount: 0 }]);
	};

	const removeDebt = (index: number) => {
		setDebts(debts.filter((_, i) => i !== index));
	};

	const updateDebt = (
		index: number,
		field: "userId" | "amount",
		value: string | number,
	) => {
		const newDebts = [...debts];
		if (field === "userId") {
			newDebts[index].userId = value as string;
		} else {
			newDebts[index].amount = Number(value);
		}
		setDebts(newDebts);
	};

	return (
		<form action={action} className="space-y-6">
			{state && !state.success && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					エラー: {state.error}
				</div>
			)}

			<div>
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					イベント名
				</label>
				<Input
					id="name"
					name="name"
					type="text"
					defaultValue={lending?.name}
					placeholder="例: 飲み会、旅行"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="amount"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					総額（円）
				</label>
				<Input
					id="amount"
					name="amount"
					type="number"
					defaultValue={lending?.amount}
					placeholder="0"
					required
				/>
			</div>

			<div>
				<label
					htmlFor="eventDate"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					日付
				</label>
				<DatePicker
					id="eventDate"
					name="eventDate"
					defaultValue={lending?.eventDate}
					placeholder="日付を選択"
				/>
			</div>

			<div>
				<div className="flex justify-between items-center mb-2">
					<label className="block text-sm font-medium text-gray-700">
						債務者
					</label>
					<button
						type="button"
						onClick={addDebt}
						className="text-sm text-sky-600 hover:text-sky-700"
					>
						+ 追加
					</button>
				</div>
				<div className="space-y-3">
					{debts.map((debt, index) => (
						<div key={index} className="flex gap-2">
							<select
								value={debt.userId}
								onChange={(e) => updateDebt(index, "userId", e.target.value)}
								className="flex-1 rounded-lg bg-slate-200 px-4 py-3 h-11"
								required
							>
								<option value="">ユーザーを選択</option>
								{MOCK_USERS.map((user) => (
									<option key={user.id} value={user.id}>
										{user.displayName}
									</option>
								))}
							</select>
							<Input
								type="number"
								value={debt.amount}
								onChange={(e) =>
									updateDebt(index, "amount", e.target.value)
								}
								placeholder="金額"
								className="w-32"
								required
							/>
							{debts.length > 1 && (
								<button
									type="button"
									onClick={() => removeDebt(index)}
									className="px-3 py-2 text-red-600 hover:text-red-700"
								>
									削除
								</button>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="flex gap-4">
				<Button type="submit" color="primary" isPending={isPending}>
					{mode === "create" ? "作成" : "更新"}
				</Button>
				<Button
					type="button"
					color="default"
					onPress={() => router.back()}
					isDisabled={isPending}
				>
					キャンセル
				</Button>
			</div>
		</form>
	);
}
