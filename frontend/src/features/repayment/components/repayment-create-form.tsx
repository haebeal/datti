import { useForm } from "@tanstack/react-form";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Credit } from "@/features/credit/types";
import { cn } from "@/utils/cn";
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
			className={cn(
				"p-6",
				"flex flex-col gap-5",
				"bg-white border border-gray-200 rounded-xl",
			)}
		>
			<h2 className="text-base sm:text-xl font-semibold text-primary-base">
				返す相手と金額
			</h2>

			<form.Field name="debtorId">
				{(field) => (
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							誰に？
						</label>
						<Select<Credit>
							id={field.name}
							name={field.name}
							defaultValue={field.state.value}
							placeholder={
								hasCandidates ? "返す相手を選択" : "返せるユーザーがいません"
							}
							options={debtCredits}
							getOptionLabel={getCreditLabel}
							getOptionValue={(c) => c.user.id}
							required
						/>
						<ErrorText>{getFieldErrorMessage(field.state.meta.errors)}</ErrorText>
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
							onChange={(e) =>
								field.handleChange(Number(e.target.value) || 0)
							}
							onBlur={field.handleBlur}
							placeholder="0"
						/>
						<ErrorText>{getFieldErrorMessage(field.state.meta.errors)}</ErrorText>
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<button
						type="submit"
						disabled={isSubmitting || !hasCandidates}
						className={cn(
							"px-4 py-2 self-end rounded-md",
							"border border-primary-base bg-primary-base text-white",
							"hover:bg-primary-hover active:bg-primary-active",
							"disabled:opacity-50 disabled:cursor-not-allowed",
							"focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
							"transition-colors",
						)}
					>
						{isSubmitting ? "処理中…" : "返した記録をつける"}
					</button>
				)}
			</form.Subscribe>
		</form>
	);
}
