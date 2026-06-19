import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
			className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
		>
			<form.Field name="name">
				{(field) => (
					<>
						<label htmlFor={field.name} className="text-sm font-semibold">
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
							"px-4 py-2",
							"rounded-md",
							"border border-primary-base bg-primary-base text-white",
							"hover:bg-primary-hover active:bg-primary-active",
							"disabled:opacity-50 disabled:cursor-not-allowed",
							"focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
							"transition-colors",
						)}
					>
						{isSubmitting ? "作成中…" : "作成"}
					</button>
				)}
			</form.Subscribe>
		</form>
	);
}
