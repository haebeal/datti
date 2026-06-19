import { useForm } from "@tanstack/react-form";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
			className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
		>
			<h2 className="text-lg font-semibold">基本情報</h2>
			<form.Field name="name">
				{(field) => (
					<>
						<label htmlFor={field.name} className="text-sm">
							グループ名
						</label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
						/>
						{field.state.meta.errors.length > 0 && (
							<ErrorText>
								{field.state.meta.errors
									.map((err) =>
										typeof err === "string" ? err : err?.message,
									)
									.filter(Boolean)
									.join(", ")}
							</ErrorText>
						)}
					</>
				)}
			</form.Field>
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<button
						type="submit"
						disabled={isSubmitting}
						className={cn(
							"px-4 py-2 self-end",
							"rounded-md",
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
