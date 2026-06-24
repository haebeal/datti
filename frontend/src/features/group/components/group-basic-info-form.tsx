import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getFieldErrorMessage } from "@/utils/form";
import { useUpdateGroup } from "../mutations";
import { updateGroupSchema } from "../schema";
import type { Group } from "../types";

export function GroupBasicInfoForm({ group }: { group: Group }) {
	const updateGroup = useUpdateGroup(group.id);

	const form = useForm({
		defaultValues: { name: group.name },
		validators: { onChange: updateGroupSchema },
		onSubmit: async ({ value }) => {
			await updateGroup.mutateAsync(value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-3"
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
					<Button type="submit" disabled={isSubmitting} className="self-end">
						{isSubmitting ? "更新中…" : "更新"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
