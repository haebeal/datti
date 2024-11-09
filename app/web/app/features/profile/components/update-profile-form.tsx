import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";

import type { User } from "~/api/@types";
import {
	Button,
	ErrorText,
	Input,
	Label,
	RequirementBadge,
} from "~/components";

import type { UpdateProfileAction } from "~/features/profile/actions";
import { updateProfileSchema as schema } from "~/features/profile/schemas";

interface Props {
	defaultValue?: User;
}

export function UpdateProfileForm({ defaultValue }: Props) {
	const actionData = useActionData<UpdateProfileAction>();
	const [form, { name, photoUrl }] = useForm({
		defaultValue,
		lastResult: actionData?.submission,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});

	const { state } = useNavigation();

	const emailId = useId();
	const nameId = useId();
	const photoUrlId = useId();

	return (
		<Form
			method="post"
			{...getFormProps(form)}
			className="grid grid-cols-5 gap-8 md:gap-3"
		>
			<div className="col-span-5 md:col-span-2 grid place-content-center max-h-80 md:py-10">
				<img
					aria-label={`${defaultValue?.name}-avator`}
					src={photoUrl.value}
					className="w-40 h-40 md:w-60 md:h-60 rounded-full border border-gray-200 hover:cursor-pointer"
				/>
			</div>
			<div className="flex flex-col gap-8 items-center col-span-5 md:col-span-3">
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={emailId}>メールアドレス</Label>
					<Input
						defaultValue={defaultValue?.email}
						readOnly
						disabled={state !== "idle"}
						id={emailId}
						placeholder="datti@example.com"
					/>
				</div>
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={nameId}>
						ユーザー名
						<RequirementBadge>※必須</RequirementBadge>
					</Label>
					<Input
						{...getInputProps(name, { type: "text" })}
						data-1p-ignore
						placeholder="ユーザー名を入力"
						disabled={state !== "idle"}
						isError={name.errors !== undefined}
						id={nameId}
					/>
					<ErrorText>{name.errors?.toString()}</ErrorText>
				</div>
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={photoUrlId}>
						プロフィール画像
						<RequirementBadge>※必須</RequirementBadge>
					</Label>
					<Input
						{...getInputProps(photoUrl, { type: "text" })}
						data-1p-ignore
						placeholder="プロフィール画像のURLを入力"
						disabled={state !== "idle"}
						isError={photoUrl.errors !== undefined}
						id={photoUrlId}
					/>
					<ErrorText>{photoUrl.errors?.toString()}</ErrorText>
				</div>
				<Button
					variant="solid-fill"
					size="md"
					type="submit"
					className="w-full"
					aria-disabled={state !== "idle"}
				>
					更新
				</Button>
			</div>
		</Form>
	);
}
