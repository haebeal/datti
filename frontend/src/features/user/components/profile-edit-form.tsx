import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getFieldErrorMessage } from "@/utils/form";
import { useUpdateProfile } from "../mutations";
import { profileEditSchema } from "../schema";
import type { User } from "../types";
import { AvatarPicker } from "./avatar-picker";

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
			className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
		>
			<h2 className="font-heading text-[17px] font-bold text-foreground">
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
					<FormField
						label="名前"
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
