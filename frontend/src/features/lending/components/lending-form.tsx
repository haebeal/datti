import { useForm } from "@tanstack/react-form";
import { DatePicker } from "@/components/ui/date-picker";
import { ErrorText } from "@/components/ui/error-text";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { GroupMember } from "@/features/group/types";
import { cn } from "@/utils/cn";
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
			className={cn(
				"p-6",
				"flex flex-col gap-5",
				"bg-white border border-gray-200 rounded-xl",
			)}
		>
			<h2 className="text-base sm:text-xl font-semibold text-primary-base">
				なにに使った？
			</h2>

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
							onChange={(e) =>
								field.handleChange(Number(e.target.value) || 0)
							}
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
				<span className="text-base sm:text-xl font-semibold text-primary-base">
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
								<button
									type="button"
									onClick={splitBill}
									disabled={field.state.value.length === 0}
									className={cn(
										"px-4 py-2 rounded-md text-sm",
										"border border-primary-base text-primary-base",
										"hover:bg-primary-base hover:text-white",
										"disabled:opacity-50",
										"transition-colors",
									)}
								>
									割り勘
								</button>
								<button
									type="button"
									onClick={addDebt}
									disabled={!canAddMore}
									className={cn(
										"px-4 py-2 rounded-md text-sm",
										"border border-primary-base text-primary-base",
										"hover:bg-primary-base hover:text-white",
										"disabled:opacity-50",
										"transition-colors",
									)}
								>
									+ ひとを追加
								</button>
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
						<div
							className={cn(
								"flex items-center gap-3",
								"px-4 py-2.5",
								"bg-gray-100 rounded-md",
							)}
						>
							<span className="text-sm text-primary-base flex-1">
								{currentUserName}（自分）
							</span>
							<span
								className={cn(
									"text-sm font-semibold",
									myShare < 0 ? "text-error-base" : "text-primary-base",
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
								<div key={index} className="flex gap-3 items-start">
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
														<span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
										<button
											type="button"
											onClick={() => debtsField.removeValue(index)}
											className={cn(
												"px-3 py-2 rounded-md text-sm",
												"border border-error-base text-error-base",
												"hover:bg-error-base hover:text-white",
												"transition-colors",
											)}
										>
											削除
										</button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<button
						type="submit"
						disabled={isSubmitting}
						className={cn(
							"px-4 py-2 self-end rounded-md",
							"border border-primary-base bg-primary-base text-white",
							"hover:bg-primary-hover active:bg-primary-active",
							"disabled:opacity-50 disabled:cursor-not-allowed",
							"focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
							"transition-colors",
						)}
					>
						{isSubmitting ? "送信中…" : submitLabel}
					</button>
				)}
			</form.Subscribe>
		</form>
	);
}
