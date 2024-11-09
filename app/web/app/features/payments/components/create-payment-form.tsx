import {
	getFormProps,
	getInputProps,
	getSelectProps,
	useForm,
	useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";

import type { PaymentUser } from "~/api/@types";
import {
	Button,
	DatePicker,
	ErrorText,
	Input,
	Label,
	RequirementBadge,
	Select,
} from "~/components";

import { createPaymentSchema as schema } from "../schemas";

interface Props {
	paymentUsers: PaymentUser[];
}

export function CreatePaymentForm({ paymentUsers }: Props) {
	const [form, { paidTo, paidAt, amount }] = useForm({
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema,
			});
		},
	});

	const { change } = useInputControl(paidAt);
	const { state } = useNavigation();

	const paidToId = useId();
	const paidAtId = useId();
	const amountId = useId();

	return (
		<Form
			{...getFormProps(form)}
			method="post"
			className="w-full flex flex-col gap-8 items-center col-span-4"
		>
			<div className="w-full flex flex-col gap-2">
				<Label htmlFor={paidAtId}>
					返済日
					<RequirementBadge>※必須</RequirementBadge>
				</Label>
				<DatePicker
					{...getInputProps(paidAt, { type: "text" })}
					data-1p-ignore
					placeholder="返済日を選択"
					disabled={state !== "idle"}
					isError={paidAt.errors !== undefined}
					id={paidAtId}
				/>
				<ErrorText>{paidAt.errors?.toString()}</ErrorText>
			</div>
			<div className="w-full">
				<Label htmlFor={paidToId}>
					返済する人
					<RequirementBadge>※必須</RequirementBadge>
				</Label>
				<Select
					{...getSelectProps(paidTo)}
					isError={paidTo.errors !== undefined}
					disabled={state !== "idle"}
					id={paidToId}
				>
					<option hidden value="">
						ユーザーを選択
					</option>
					{paymentUsers.map(({ user }) => (
						<option key={user.userId} value={user.userId}>
							{user.name}
						</option>
					))}
				</Select>
				<ErrorText>{paidTo.errors?.toString()}</ErrorText>
			</div>
			<div className="w-full flex flex-col gap-2">
				<Label htmlFor={amountId}>返済額</Label>
				<Input
					{...getInputProps(amount, { type: "number" })}
					data-1p-ignore
					placeholder="支払額を入力"
					disabled={state !== "idle"}
					isError={amount.errors !== undefined}
					id={amountId}
				/>
				<ErrorText>{amount.errors?.toString()}</ErrorText>
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
