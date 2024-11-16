import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";

import type { GroupEndpoints_GroupGetResponse } from "~/api/@types";
import {
	Button,
	ErrorText,
	Input,
	Label,
	RequirementBadge,
} from "~/components";

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
		<Form
			method="post"
			{...getFormProps(form)}
			className="w-full flex flex-col gap-8 items-center col-span-4"
		>
			<div className="w-full flex flex-col gap-2">
				<Label htmlFor={nameId}>
					グループ名
					<RequirementBadge>※必須</RequirementBadge>
				</Label>
				<Input
					{...getInputProps(name, { type: "text" })}
					data-1p-ignore
					placeholder="グループ名を入力"
					disabled={state !== "idle"}
					isError={name.errors !== undefined}
					id={nameId}
				/>
				<ErrorText>{name.errors?.toString()}</ErrorText>
			</div>
			<Button
				type="submit"
				size="md"
				variant="solid-fill"
				className="w-full"
				disabled={state !== "idle"}
			>
				作成
			</Button>
		</Form>
	);
}
