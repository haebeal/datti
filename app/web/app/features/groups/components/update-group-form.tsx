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

import type { UpdateGroupAction } from "../actions";
import { updateGroupSchema as schema } from "../schemas";

interface Props {
	defaultValue?: GroupEndpoints_GroupGetResponse;
}

export function UpdateGroupForm({ defaultValue }: Props) {
	const actionData = useActionData<UpdateGroupAction>();
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
			method="put"
			{...getFormProps(form)}
			className="flex flex-col gap-8 items-center col-span-4"
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
				更新
			</Button>
		</Form>
	);
}
