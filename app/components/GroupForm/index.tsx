import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import type { GroupAction } from "~/.server/actions";
import type { GroupEndpoints_GroupGetResponse } from "~/api/@types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { groupFormSchema } from "~/schema/groupFormSchema";

interface Props {
	defaultValue?: GroupEndpoints_GroupGetResponse;
	method: "post" | "put";
}

export function GroupForm({ defaultValue, method }: Props) {
	const actionData = useActionData<GroupAction>();
	const [form, { name }] = useForm({
		defaultValue,
		lastResult: actionData?.submission,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: groupFormSchema,
			});
		},
	});
	const { state } = useNavigation();

	const nameId = useId();

	return (
		<div className="px-4">
			<Form
				method={method}
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
					{method === "post" ? "作成" : "更新"}
				</Button>
			</Form>
		</div>
	);
}
