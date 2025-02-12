import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useId, useRef } from "react";
import { Form, useActionData, useNavigation } from "react-router";

import type { GroupEndpoints_GroupGetResponse } from "~/api/@types";
import {
	Button,
	Dialog,
	DialogBody,
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
	const dialogRef = useRef<HTMLDialogElement>(null);

	const nameId = useId();

	return (
		<>
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
				<Button
					size="md"
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						dialogRef.current?.showModal();
					}}
					variant="solid-fill"
					className="w-full bg-red-900 hover:bg-red-1000 active:bg-red-1100"
				>
					削除
				</Button>
			</Form>
			<Dialog
				aria-labelledby="confirm-delete-event"
				className="w-full max-w-[calc(560/16*1rem)]"
				ref={dialogRef}
			>
				<DialogBody>
					<h2 className="text-std-24N-150">イベントを削除しますか?</h2>
					<p>
						グループを削除すると他のユーザーからも削除されます。
						<br />
						本当によろしいですか?
						<br />
						※イベントは削除されません
					</p>
					<div className="flex flex-col mt-8 gap-5 w-full">
						<Button
							size="md"
							onClick={() => dialogRef.current?.close()}
							variant="outline"
							className="w-full"
						>
							キャンセル
						</Button>
						<Form method="delete" className="w-full">
							<Button
								size="md"
								type="submit"
								variant="solid-fill"
								className="bg-red-900 hover:bg-red-1000 active:bg-red-1100 w-full"
							>
								削除
							</Button>
						</Form>
					</div>
				</DialogBody>
			</Dialog>
		</>
	);
}
