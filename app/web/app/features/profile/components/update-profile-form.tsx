import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import type { User } from "~/api/@types";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

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
			className="grid grid-cols-5 px-4 gap-3"
		>
			<div className="col-span-5 md:col-span-2 grid place-content-center max-h-80 py-10">
				<Avatar className="w-40 h-40 md:w-60 md:h-60 border border-gray-200 hover:cursor-pointer">
					<AvatarImage src={photoUrl.value} />
					<AvatarFallback>{name.value}</AvatarFallback>
				</Avatar>
			</div>
			<div className="flex flex-col gap-8 items-center col-span-5 md:col-span-3">
				<div className="w-full">
					<Label htmlFor={emailId}>メールアドレス</Label>
					<Input
						defaultValue={defaultValue?.email}
						readOnly
						disabled={state !== "idle"}
						id={emailId}
						placeholder="datti@example.com"
					/>
				</div>
				<div className="w-full">
					<Label htmlFor={photoUrlId}>プロフィール画像</Label>
					<Input
						{...getInputProps(photoUrl, { type: "text" })}
						data-1p-ignore
						id={photoUrlId}
						disabled={state !== "idle"}
						placeholder="プロフィール画像のURLを入力"
					/>
					<p>{photoUrl.errors?.toString()}</p>
				</div>
				<div className="w-full">
					<Label htmlFor={nameId}>ユーザー名</Label>
					<Input
						{...getInputProps(name, { type: "text" })}
						data-1p-ignore
						id={nameId}
						disabled={state !== "idle"}
						placeholder="ユーザー名を入力"
					/>
					<p>{name.errors?.toString()}</p>
				</div>
				<Button
					type="submit"
					className="w-full max-w-2xl bg-sky-500 hover:bg-sky-600  font-semibold"
					disabled={state !== "idle"}
				>
					更新
				</Button>
			</div>
		</Form>
	);
}
