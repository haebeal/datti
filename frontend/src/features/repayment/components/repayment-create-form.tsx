import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Credit } from "@/features/credit/types";
import { formatCurrency } from "@/utils/format";
import { createRepaymentSchema } from "../schema";
import type { CreateRepaymentInput } from "../schema";

type Props = {
	credits: Credit[];
	defaultDebtorId?: string;
	defaultAmount?: number;
	onSubmit: (values: CreateRepaymentInput) => Promise<void>;
};

function getFieldErrorMessage(errors: ReadonlyArray<unknown>) {
	if (errors.length === 0) return undefined;
	return errors
		.map((err) =>
			typeof err === "string"
				? err
				: typeof err === "object" && err && "message" in err
					? String((err as { message: unknown }).message)
					: undefined,
		)
		.filter(Boolean)
		.join(", ");
}

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
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							誰に？
						</label>
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
						<ErrorText>
							{getFieldErrorMessage(field.state.meta.errors)}
						</ErrorText>
					</div>
				)}
			</form.Field>

			<form.Field name="amount">
				{(field) => (
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							いくら？
						</label>
						<Input
							type="number"
							id={field.name}
							name={field.name}
							value={String(field.state.value)}
							onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
							onBlur={field.handleBlur}
							placeholder="0"
						/>
						<ErrorText>
							{getFieldErrorMessage(field.state.meta.errors)}
						</ErrorText>
					</div>
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
