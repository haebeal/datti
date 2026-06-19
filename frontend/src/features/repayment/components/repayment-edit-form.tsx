import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getFieldErrorMessage } from "@/utils/form";
import type { UpdateRepaymentInput } from "../schema";
import { updateRepaymentSchema } from "../schema";

type Props = {
	defaultAmount: number;
	onSubmit: (values: UpdateRepaymentInput) => Promise<void>;
};

export function RepaymentEditForm({ defaultAmount, onSubmit }: Props) {
	const form = useForm({
		defaultValues: { amount: defaultAmount },
		validators: { onChange: updateRepaymentSchema },
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
		>
			<form.Field name="amount">
				{(field) => (
					<FormField
						label="金額"
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
					<Button type="submit" disabled={isSubmitting} className="self-end">
						{isSubmitting ? "更新中…" : "更新"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
