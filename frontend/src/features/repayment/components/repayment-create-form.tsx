import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Credit } from "@/features/credit/types";
import { getFieldErrorMessage } from "@/utils/form";
import { formatCurrency } from "@/utils/format";
import type { CreateRepaymentInput } from "../schema";
import { createRepaymentSchema } from "../schema";

type Props = {
	credits: Credit[];
	defaultDebtorId?: string;
	defaultAmount?: number;
	onSubmit: (values: CreateRepaymentInput) => Promise<void>;
};

export function RepaymentCreateForm({
	credits,
	defaultDebtorId,
	defaultAmount,
	onSubmit,
}: Props) {
	const form = useForm({
		defaultValues: {
			debtorId: defaultDebtorId ?? "",
			amount: defaultAmount ?? 0,
		},
		validators: { onChange: createRepaymentSchema },
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	const debtCredits = credits.filter((c) => c.amount < 0);
	const hasCandidates = debtCredits.length > 0;

	const getCreditLabel = (credit: Credit) =>
		`${credit.user.name} (借り: ${formatCurrency(Math.abs(credit.amount))})`;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-5"
		>
			<form.Field name="debtorId">
				{(field) => (
					<FormField
						label="誰に？"
						htmlFor={field.name}
						error={getFieldErrorMessage(field.state.meta.errors)}
					>
						<Select
							name={field.name}
							value={field.state.value}
							onValueChange={field.handleChange}
							required
							disabled={!hasCandidates}
						>
							<SelectTrigger id={field.name} className="w-full">
								<SelectValue
									placeholder={
										hasCandidates
											? "返す相手を選択"
											: "返せるユーザーがいません"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{debtCredits.map((c) => (
									<SelectItem key={c.user.id} value={c.user.id}>
										{getCreditLabel(c)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>
				)}
			</form.Field>

			<form.Field name="amount">
				{(field) => (
					<FormField
						label="いくら？"
						htmlFor={field.name}
						error={getFieldErrorMessage(field.state.meta.errors)}
					>
						<Input
							type="number"
							id={field.name}
							name={field.name}
							value={String(field.state.value)}
							onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
							onBlur={field.handleBlur}
							placeholder="0"
						/>
					</FormField>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						type="submit"
						size="lg"
						disabled={isSubmitting || !hasCandidates}
						className="w-full"
					>
						{isSubmitting ? "処理中…" : "返した記録をつける"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
