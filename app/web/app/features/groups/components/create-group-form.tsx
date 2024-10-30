import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import type { GroupEndpoints_GroupGetResponse } from "~/api/@types";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import type { CreateGroupAction } from "../actions";
import { createGroupSchema as schema } from "../schemas";

interface Props {
	defaultValue?: GroupEndpoints_GroupGetResponse;
}

export function CreateGroupForm({ defaultValue }: Props) {
	const actionData = useActionData<CreateGroupAction>();
	const [form, { name }] = useForm({
		defaultValue,
		lastResult: actionData?.submission,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema,
			});
		},
	});
	const { state } = useNavigation();

	const nameId = useId();

	return (
		<div className="px-4">
			<Form
				method="post"
				{...getFormProps(form)}
				className="flex flex-col gap-8 items-center col-span-4"
			>
				<div className="w-full">
					<Label htmlFor={nameId}>グループ名</Label>
					<Input
						{...getInputProps(name, { type: "text" })}
						data-1p-ignore
						placeholder="グループ名を入力"
						disabled={state !== "idle"}
						id={nameId}
					/>
					<p>{name.errors?.toString()}</p>
				</div>
				<Button
					type="submit"
					className="w-full max-w-2xl bg-sky-500 hover:bg-sky-600  font-semibold"
					disabled={state !== "idle"}
				>
					作成
				</Button>
			</Form>
		</div>
	);
}
