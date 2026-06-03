import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { useUpdateProfile } from "../mutations";
import { profileEditSchema } from "../schema";
import type { User } from "../types";
import { AvatarPicker } from "./avatar-picker";

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

export function ProfileEditForm({ user }: { user: User }) {
	const updateProfile = useUpdateProfile();
	const [avatar, setAvatar] = useState(user.avatar);

	const form = useForm({
		defaultValues: { name: user.name, avatar: user.avatar },
		validators: { onChange: profileEditSchema },
		onSubmit: async ({ value }) => {
			await updateProfile.mutateAsync({ ...value, avatar });
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
				"flex flex-col gap-5",
				"bg-white border border-gray-200 rounded-xl",
			)}
		>
			<h2 className="text-base sm:text-xl font-semibold text-primary-base">
				プロフィール編集
			</h2>

			<div className="flex flex-col gap-2">
				<span className="text-xs font-medium">アバター</span>
				<AvatarPicker
					currentAvatar={avatar}
					onAvatarChange={(url) => {
						setAvatar(url);
						form.setFieldValue("avatar", url);
					}}
				/>
			</div>

			<form.Field name="name">
				{(field) => (
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							名前
						</label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
						/>
						<ErrorText>{getFieldErrorMessage(field.state.meta.errors)}</ErrorText>
					</div>
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
