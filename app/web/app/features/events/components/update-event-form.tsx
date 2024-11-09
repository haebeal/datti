import {
	FormProvider,
	getFormProps,
	getInputProps,
	getSelectProps,
	useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useId } from "react";

import type { EventEndpoints_EventPutRequest, Member } from "~/api/@types";
import {
	Button,
	DatePicker,
	ErrorText,
	Input,
	Label,
	RequirementBadge,
	Select,
	SupportText,
} from "~/components";

import type { UpdateEventAction } from "../actions";
import { updateEventSchema as schema } from "../schemas";

interface Props {
	defaultValue?: Partial<EventEndpoints_EventPutRequest>;
	members: Member[];
}

export function UpdateEventForm({ defaultValue, members }: Props) {
	const actionData = useActionData<UpdateEventAction>();
	const [form, { name, eventedAt, amount, payments, paidBy }] = useForm({
		defaultValue,
		lastResult: actionData?.submission,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema,
			});
		},
	});
	const paymentFields = payments.getFieldList();

	const { state } = useNavigation();

	// biome-ignore lint:
	useEffect(() => {
		members
			.filter(
				(member) =>
					member.userId !== defaultValue?.paidBy &&
					!paymentFields.some((field) => field.value?.paidTo === member.userId),
			)
			.map((member) => {
				console.log(member);
				form.insert({
					name: payments.name,
					defaultValue: {
						paidTo: member.userId,
						amount: 0,
					},
				});
			});
	}, []);

	const nameId = useId();
	const eventedAtId = useId();
	const paidById = useId();
	const amountId = useId();
	const burdenId = useId();

	return (
		<FormProvider context={form.context}>
			<Form
				{...getFormProps(form)}
				method="put"
				className="flex flex-col gap-8 items-center col-span-4"
			>
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={nameId}>
						イベント名
						<RequirementBadge>※必須</RequirementBadge>
					</Label>
					<Input
						{...getInputProps(name, { type: "text" })}
						data-1p-ignore
						placeholder="イベント名を入力"
						disabled={state !== "idle"}
						isError={name.errors !== undefined}
						id={nameId}
					/>
					<ErrorText>{name.errors?.toString()}</ErrorText>
				</div>

				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={eventedAtId}>
						イベント日
						<RequirementBadge>※必須</RequirementBadge>
					</Label>
					<DatePicker
						{...getInputProps(eventedAt, { type: "text" })}
						data-1p-ignore
						disabled={state !== "idle"}
						isError={name.errors !== undefined}
						id={eventedAtId}
					/>
					<ErrorText>{eventedAt.errors?.toString()}</ErrorText>
				</div>
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={paidById}>
						支払った人
						<RequirementBadge>※必須</RequirementBadge>
					</Label>
					<Select
						{...getSelectProps(paidBy)}
						isError={paidBy.errors !== undefined}
						onChange={(event) => {
							for (let i = 0; i < members.length; i++) {
								form.remove({
									name: payments.name,
									index: 0,
								});
							}
							window.setTimeout(() => {
								for (const member of members.filter(
									(member) => member.userId !== event.target.value,
								)) {
									form.insert({
										name: payments.name,
										defaultValue: {
											paidTo: member.userId,
											amount: "0",
										},
									});
								}
							}, 250);
						}}
						disabled={state !== "idle"}
						id={paidById}
					>
						<option hidden value="">
							ユーザーを選択
						</option>
						{members.map((member) => (
							<option key={member.userId} value={member.userId}>
								{member.name}
							</option>
						))}
					</Select>
					<ErrorText>{paidBy.errors?.toString()}</ErrorText>
				</div>
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={burdenId}>
						負担額
						<SupportText>※自動計算</SupportText>
					</Label>
					<Input
						value={
							Number(form.value?.amount ?? 0) -
							(Array.isArray(form.value?.payments)
								? form.value.payments.reduce(
										(accumulator, payment) =>
											accumulator + Number(payment?.amount ?? 0),
										0,
									)
								: 0)
						}
						aria-disabled
						id={burdenId}
					/>
				</div>
				<div className="w-full flex flex-col gap-2">
					<Label htmlFor={amountId}>
						支払額
						<RequirementBadge>※必須</RequirementBadge>
					</Label>
					<Input
						{...getInputProps(amount, { type: "number" })}
						placeholder="支払額を入力"
						disabled={state !== "idle"}
						isError={amount.errors !== undefined}
						id={amountId}
					/>
					<ErrorText>{amount.errors?.toString()}</ErrorText>
				</div>
				{paymentFields.map((payment) => (
					<div key={payment.id} className="w-full flex flex-col gap-2">
						<Label htmlFor={payment.formId}>
							{
								members.find(
									({ userId }) => userId === payment.getFieldset().paidTo.value,
								)?.name
							}
						</Label>
						<input
							{...getInputProps(payment.getFieldset().paidTo, {
								type: "hidden",
							})}
							key={payment.getFieldset().paidTo.id}
						/>
						<Input
							{...getInputProps(payment.getFieldset().amount, {
								type: "number",
							})}
							key={payment.getFieldset().amount.id}
							placeholder="立替金額を入力"
							isError={payment.getFieldset().amount.errors !== undefined}
							disabled={state !== "idle"}
							id={payment.formId}
						/>
						<ErrorText>
							{payment.getFieldset().amount.errors?.toString()}
						</ErrorText>
					</div>
				))}
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
		</FormProvider>
	);
}
