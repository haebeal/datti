import { useForm } from "@tanstack/react-form";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { updateRepaymentSchema } from "../schema";
import type { UpdateRepaymentInput } from "../schema";

type Props = {
	defaultAmount: number;
	onSubmit: (values: UpdateRepaymentInput) => Promise<void>;
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
			className={cn(
				"p-6",
				"flex flex-col gap-3",
				"bg-white border border-gray-200 rounded-xl",
			)}
		>
			<form.Field name="amount">
				{(field) => (
					<>
						<label htmlFor={field.name} className="text-xs font-medium">
							金額
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
					</>
				)}
			</form.Field>
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<button
						type="submit"
						disabled={isSubmitting}
						className={cn(
							"px-4 py-2 self-end rounded-md",
							"border border-primary-base bg-primary-base text-white",
							"hover:bg-primary-hover active:bg-primary-active",
							"disabled:opacity-50 disabled:cursor-not-allowed",
							"focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
							"transition-colors",
						)}
					>
						{isSubmitting ? "更新中…" : "更新"}
					</button>
				)}
			</form.Subscribe>
		</form>
	);
}
