import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getFieldErrorMessage } from "@/utils/form";
import { useCreateGroup } from "../mutations";
import { createGroupSchema } from "../schema";

export function GroupCreateForm() {
	const navigate = useNavigate();
	const createGroup = useCreateGroup();

	const form = useForm({
		defaultValues: { name: "" },
		validators: { onChange: createGroupSchema },
		onSubmit: async ({ value }) => {
			const created = await createGroup.mutateAsync(value);
			navigate({
				to: "/groups/$groupId/settings",
				params: { groupId: created.id },
			});
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
			<form.Field name="name">
				{(field) => (
					<FormField
						label="グループ名"
						htmlFor={field.name}
						error={getFieldErrorMessage(field.state.meta.errors)}
					>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
						/>
					</FormField>
				)}
			</form.Field>
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting} className="self-start">
						{isSubmitting ? "作成中…" : "作成"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
