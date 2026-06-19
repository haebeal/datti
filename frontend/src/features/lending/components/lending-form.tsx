import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { GroupMember } from "@/features/group/types";
import { cn } from "@/lib/utils";
import { lendingFormSchema, type LendingFormInput } from "../schema";

type Props = {
	members: GroupMember[];
	currentUserId: string;
	defaultValues?: LendingFormInput;
	submitLabel: string;
	onSubmit: (values: LendingFormInput) => Promise<void>;
};

const initialValues: LendingFormInput = {
	name: "",
	amount: 0,
	eventDate: new Intl.DateTimeFormat("sv-SE", {
		timeZone: "Asia/Tokyo",
	}).format(new Date()),
	debts: [{ userId: "", amount: 0 }],
};

function getFieldErrorMessage(
	errors: ReadonlyArray<unknown>,
): string | undefined {
	if (errors.length === 0) return undefined;
	return errors
		.map((err) =>
			typeof err === "string"
				? err
				: typeof err === "object" && err && "message" in err
					? String((err as { message: unknown }).message)
					: undefined,
		)
		.filter(Boolean)
		.join(", ");
}

export function LendingForm({
	members,
	currentUserId,
	defaultValues,
	submitLabel,
	onSubmit,
}: Props) {
	const form = useForm({
		defaultValues: defaultValues ?? initialValues,
		validators: { onChange: lendingFormSchema },
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
	});

	const availableMembers = members.filter((m) => m.id !== currentUserId);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-5"
		>
			<form.Field name="name">
				{(field) => (
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							タイトル
						</label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							placeholder="例: ランチ代, 飲み会"
						/>
						<ErrorText>{getFieldErrorMessage(field.state.meta.errors)}</ErrorText>
					</div>
				)}
			</form.Field>

			<form.Field name="amount">
				{(field) => (
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							いくら？
						</label>
						<Input
							id={field.name}
							name={field.name}
							type="number"
							value={String(field.state.value)}
							onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
							onBlur={field.handleBlur}
							placeholder="0"
						/>
						<ErrorText>{getFieldErrorMessage(field.state.meta.errors)}</ErrorText>
					</div>
				)}
			</form.Field>

			<form.Field name="eventDate">
				{(field) => (
					<div className="flex flex-col gap-1.5">
						<label htmlFor={field.name} className="text-xs font-medium">
							いつ？
						</label>
						<DatePicker
							id={field.name}
							name={field.name}
							defaultValue={field.state.value}
							onChange={(e) => field.handleChange(e.currentTarget.value)}
							placeholder="日付を選択"
						/>
						<ErrorText>{getFieldErrorMessage(field.state.meta.errors)}</ErrorText>
					</div>
				)}
			</form.Field>

			<div className="flex items-center gap-2">
				<span className="font-heading text-base font-bold text-foreground">
					だれがいくら？
				</span>
				<div className="flex-1" />
				<form.Field name="debts" mode="array">
					{(field) => {
						const totalAmount = Number(form.state.values.amount) || 0;
						const memberCount = field.state.value.length + 1;
						const canAddMore = field.state.value.length < availableMembers.length;

						const splitBill = () => {
							const splitAmount = Math.floor(totalAmount / memberCount);
							for (let i = 0; i < field.state.value.length; i++) {
								form.setFieldValue(`debts[${i}].amount`, splitAmount);
							}
						};
						const addDebt = () => {
							field.pushValue({ userId: "", amount: 0 });
						};
						return (
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={splitBill}
									disabled={field.state.value.length === 0}
								>
									割り勘
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addDebt}
									disabled={!canAddMore}
								>
									＋ ひとを追加
								</Button>
							</div>
						);
					}}
				</form.Field>
			</div>

			<form.Subscribe
				selector={(state) => ({
					amount: state.values.amount,
					debts: state.values.debts,
				})}
			>
				{({ amount, debts }) => {
					const othersTotal = debts.reduce(
						(sum, d) => sum + (Number(d.amount) || 0),
						0,
					);
					const myShare = (Number(amount) || 0) - othersTotal;
					const currentUserName =
						members.find((m) => m.id === currentUserId)?.name ?? "自分";
					return (
						<div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-2.5">
							<span className="flex-1 text-sm text-foreground">
								{currentUserName}（自分）
							</span>
							<span
								className={cn(
									"text-sm font-semibold",
									myShare < 0 ? "text-destructive" : "text-foreground",
								)}
							>
								¥{myShare.toLocaleString()}
							</span>
						</div>
					);
				}}
			</form.Subscribe>

			<form.Field name="debts" mode="array">
				{(debtsField) => (
					<div className="flex flex-col gap-3">
						{debtsField.state.value.map((_, index) => {
							const selectedElsewhere = debtsField.state.value
								.map((d, i) => (i === index ? null : d.userId))
								.filter((id): id is string => !!id);
							const options = availableMembers.filter(
								(m) => !selectedElsewhere.includes(m.id),
							);
							return (
								<div key={index} className="flex items-start gap-3">
									<div className="flex-1">
										<form.Field name={`debts[${index}].userId`}>
											{(field) => (
												<>
													<Select<GroupMember>
														id={field.name}
														name={field.name}
														defaultValue={field.state.value}
														placeholder="メンバーを選択"
														options={options}
														getOptionLabel={(m) => m.name}
														getOptionValue={(m) => m.id}
														required
													/>
													<ErrorText>
														{getFieldErrorMessage(field.state.meta.errors)}
													</ErrorText>
												</>
											)}
										</form.Field>
									</div>
									<div className="w-32">
										<form.Field name={`debts[${index}].amount`}>
											{(field) => (
												<>
													<div className="relative">
														<span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
															¥
														</span>
														<Input
															type="number"
															name={field.name}
															value={String(field.state.value)}
															onChange={(e) =>
																field.handleChange(Number(e.target.value) || 0)
															}
															onBlur={field.handleBlur}
															className="w-full pl-7"
														/>
													</div>
													<ErrorText>
														{getFieldErrorMessage(field.state.meta.errors)}
													</ErrorText>
												</>
											)}
										</form.Field>
									</div>
									{debtsField.state.value.length > 1 && (
										<Button
											type="button"
											variant="outline"
											className="border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
											onClick={() => debtsField.removeValue(index)}
										>
											削除
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						type="submit"
						size="lg"
						disabled={isSubmitting}
						className="w-full"
					>
						{isSubmitting ? "送信中…" : submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
