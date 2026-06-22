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
			className="flex max-w-[460px] flex-col gap-5"
		>
			<AvatarPicker
				currentAvatar={avatar}
				onAvatarChange={(url) => {
					setAvatar(url);
					form.setFieldValue("avatar", url);
				}}
			/>

			<form.Field name="name">
				{(field) => (
					<FormField
						label="表示名"
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

			<FormField
				label="メールアドレス"
				hint="ログインに使うメールアドレスは変更できません。"
			>
				<div className="flex h-11 items-center rounded-lg border border-input bg-secondary px-3.5 text-sm text-muted-foreground">
					{user.email}
				</div>
			</FormField>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting} className="self-start">
						{isSubmitting ? "保存中…" : "変更を保存"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
