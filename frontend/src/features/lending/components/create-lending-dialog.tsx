import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { groupColorFor, Monogram } from "@/components/ui/monogram";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
	groupMembersQueryOptions,
	groupsQueryOptions,
} from "@/features/group/queries";
import type { GroupMember } from "@/features/group/types";
import { useCreateLending } from "@/features/lending/mutations";
import {
	type LendingFormInput,
	lendingFormSchema,
} from "@/features/lending/schema";
import { meQueryOptions } from "@/features/user/queries";
import { cn } from "@/lib/utils";
import { getFieldErrorMessage } from "@/utils/form";
import { yen } from "@/utils/format";

const fieldsSchema = lendingFormSchema.pick({
	name: true,
	amount: true,
	eventDate: true,
});

const todayJst = () =>
	new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
		new Date(),
	);

type SplitMode = "even" | "custom";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** 指定するとそのグループに固定。無ければグループ選択ピルを表示。 */
	groupId?: string;
};

/** 立て替えを追加するモーダル。フォームはこのコンポーネント内に直書き。 */
export function CreateLendingDialog({ open, onOpenChange, groupId }: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>立て替えを追加</DialogTitle>
				</DialogHeader>
				{open && (
					<CreateBody
						lockedGroupId={groupId}
						onClose={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

/** グループ選択 + データ読み込み。グループ確定後にフォームを描画する。 */
function CreateBody({
	lockedGroupId,
	onClose,
}: {
	lockedGroupId?: string;
	onClose: () => void;
}) {
	const groupsQuery = useQuery({
		...groupsQueryOptions,
		enabled: !lockedGroupId,
	});
	const groups = groupsQuery.data ?? [];

	const [selectedId, setSelectedId] = useState<string | null>(
		lockedGroupId ?? null,
	);
	useEffect(() => {
		if (!lockedGroupId && !selectedId && groups.length > 0)
			setSelectedId(groups[0].id);
	}, [lockedGroupId, selectedId, groups]);
	const groupId = lockedGroupId ?? selectedId;

	const membersQuery = useQuery({
		...groupMembersQueryOptions(groupId ?? ""),
		enabled: !!groupId,
	});
	const meQuery = useQuery(meQueryOptions);
	const createLending = useCreateLending(groupId ?? "");

	if (!lockedGroupId && groupsQuery.isSuccess && groups.length === 0) {
		return (
			<DialogBody>
				<div className="flex flex-col items-start gap-3 py-4 text-sm text-muted-foreground">
					まず立て替えを記録するグループが必要です。
					<Link
						to="/groups/new"
						onClick={onClose}
						className="font-semibold text-primary hover:underline"
					>
						グループをつくる →
					</Link>
				</div>
			</DialogBody>
		);
	}

	const selector = lockedGroupId ? null : (
		<div>
			<div className="mb-2 text-xs font-medium">グループ</div>
			<div className="flex flex-wrap gap-2">
				{groups.map((g) => {
					const on = g.id === groupId;
					return (
						<button
							type="button"
							key={g.id}
							onClick={() => setSelectedId(g.id)}
							className={cn(
								"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
								on
									? "border-primary bg-accent text-primary"
									: "border-border text-ink-2 hover:bg-secondary",
							)}
						>
							<Monogram
								label={g.name.charAt(0)}
								color={groupColorFor(g.id)}
								className="size-[22px] text-[11px]"
							/>
							{g.name}
						</button>
					);
				})}
			</div>
		</div>
	);

	if (!groupId || !membersQuery.data || !meQuery.data) {
		return (
			<DialogBody className="flex flex-col gap-5">
				{selector}
				<div className="py-6 text-center text-sm text-muted-foreground">
					読み込み中…
				</div>
			</DialogBody>
		);
	}

	return (
		<LendingFields
			key={groupId}
			selector={selector}
			members={membersQuery.data}
			currentUserId={meQuery.data.id}
			submitLabel="この内容で記録する"
			onClose={onClose}
			onSubmit={async (values) => {
				await createLending.mutateAsync(values);
				onClose();
			}}
		/>
	);
}

/**
 * 立て替えの入力フォーム (内容/金額/日付/立て替えた人/分割)。
 * `<form>` が DialogBody と DialogFooter をまたぎ、フッターを固定にする。
 * グループ切替時は key で remount され分割状態がリセットされる。
 */
function LendingFields({
	selector,
	members,
	currentUserId,
	submitLabel,
	onSubmit,
	onClose,
}: {
	selector: ReactNode;
	members: GroupMember[];
	currentUserId: string;
	submitLabel: string;
	onSubmit: (values: LendingFormInput) => Promise<void>;
	onClose: () => void;
}) {
	const form = useForm({
		defaultValues: { name: "", amount: 0, eventDate: todayJst() },
		validators: { onChange: fieldsSchema },
		onSubmit: async ({ value }) => {
			if (!splitValidRef.current) return;
			await onSubmit({ ...value, debts: debtsRef.current });
		},
	});

	const amount = useStore(form.store, (s) => s.values.amount);

	const [selected, setSelected] = useState<Set<string>>(
		() => new Set(members.map((m) => m.id)),
	);
	const [mode, setMode] = useState<SplitMode>("even");
	const [custom, setCustom] = useState<Record<string, number>>({});

	const splitIds = members.filter((m) => selected.has(m.id)).map((m) => m.id);
	const splitCount = splitIds.length;
	const per = splitCount ? Math.floor(amount / splitCount) : 0;
	const ca = (id: string) => custom[id] ?? 0;
	const customSum = splitIds.reduce((s, id) => s + ca(id), 0);
	const remaining = amount - customSum;

	const debtors = members.filter(
		(m) => m.id !== currentUserId && selected.has(m.id),
	);
	const debts = debtors.map((m) => ({
		userId: m.id,
		amount: mode === "even" ? per : ca(m.id),
	}));

	const splitValid =
		debtors.length > 0 &&
		(mode === "even"
			? per >= 1
			: remaining === 0 && debtors.every((m) => ca(m.id) >= 1));

	const debtsRef = useRef(debts);
	debtsRef.current = debts;
	const splitValidRef = useRef(splitValid);
	splitValidRef.current = splitValid;

	const toggle = (id: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	const splitEven = () => {
		const base = splitCount ? Math.floor(amount / splitCount) : 0;
		const rem = amount - base * splitCount;
		const next: Record<string, number> = {};
		splitIds.forEach((id, i) => {
			next[id] = base + (i === 0 ? rem : 0);
		});
		setCustom(next);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex min-h-0 flex-1 flex-col"
		>
			<DialogBody className="flex flex-col gap-5">
				{selector}

				{/* 内容 + 金額 */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.Field name="name">
						{(field) => (
							<FormField
								label="内容"
								htmlFor={field.name}
								error={getFieldErrorMessage(field.state.meta.errors)}
							>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="例：居酒屋、新幹線"
								/>
							</FormField>
						)}
					</form.Field>

					<form.Field name="amount">
						{(field) => (
							<FormField
								label="金額"
								htmlFor={field.name}
								error={getFieldErrorMessage(field.state.meta.errors)}
							>
								<div className="relative">
									<span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-num text-base font-bold text-muted-foreground">
										¥
									</span>
									<Input
										id={field.name}
										name={field.name}
										inputMode="numeric"
										value={
											field.state.value
												? field.state.value.toLocaleString()
												: ""
										}
										onChange={(e) =>
											field.handleChange(
												Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
											)
										}
										onBlur={field.handleBlur}
										placeholder="0"
										className="pl-8 font-num text-[17px] font-bold tabular-nums"
									/>
								</div>
							</FormField>
						)}
					</form.Field>
				</div>

				{/* いつ？ */}
				<form.Field name="eventDate">
					{(field) => (
						<FormField
							label="いつ？"
							htmlFor={field.name}
							error={getFieldErrorMessage(field.state.meta.errors)}
						>
							<DatePicker
								id={field.name}
								value={field.state.value}
								onChange={field.handleChange}
								placeholder="日付を選択"
							/>
						</FormField>
					)}
				</form.Field>

				{/* 立て替えた人 (作成者固定: あなたを選択ロック) */}
				<FormField label="立て替えた人">
					<div className="flex flex-wrap gap-1">
						{members.map((m) => {
							const isMe = m.id === currentUserId;
							return (
								<div
									key={m.id}
									className={cn(
										"flex min-w-14 flex-col items-center gap-1.5 px-1 py-1",
										!isMe && "opacity-50",
									)}
								>
									<UserAvatar
										user={m}
										className={cn(
											"size-10",
											isMe
												? "ring-[2.5px] ring-key ring-offset-1"
												: "ring-1 ring-border",
										)}
									/>
									<span
										className={cn(
											"whitespace-nowrap text-[11px]",
											isMe
												? "font-bold text-ink"
												: "font-medium text-muted-foreground",
										)}
									>
										{isMe ? "あなた" : m.name.split(" ")[0]}
									</span>
								</div>
							);
						})}
					</div>
				</FormField>

				{/* 負担するメンバー */}
				<FormField label={`負担するメンバー（${splitCount}人）`}>
					<div className="mb-2.5 flex gap-1.5">
						{(
							[
								["even", "均等に割り勘"],
								["custom", "金額を指定"],
							] as const
						).map(([id, label]) => {
							const on = mode === id;
							return (
								<button
									key={id}
									type="button"
									onClick={() => {
										setMode(id);
										if (id === "custom" && customSum === 0) splitEven();
									}}
									className={cn(
										"flex-1 rounded-lg border py-2.5 text-[13px] font-bold transition-colors",
										on
											? "border-key bg-key-soft text-key"
											: "border-border bg-surface text-ink-2 hover:bg-secondary",
									)}
								>
									{label}
								</button>
							);
						})}
					</div>

					<div className="overflow-hidden rounded-xl border border-border">
						{members.map((m, i) => {
							const on = selected.has(m.id);
							const isMe = m.id === currentUserId;
							return (
								<div
									key={m.id}
									className={cn(
										"flex items-center gap-3 px-3.5 py-2.5",
										i !== members.length - 1 && "border-b border-hair",
									)}
								>
									<button
										type="button"
										onClick={() => toggle(m.id)}
										className="flex min-w-0 flex-1 items-center gap-3 text-left"
									>
										<UserAvatar user={m} className="size-8" />
										<span
											className={cn(
												"truncate text-sm",
												on ? "font-medium text-ink" : "text-muted-foreground",
											)}
										>
											{isMe ? "あなた" : m.name}
										</span>
									</button>

									{on && mode === "even" && per > 0 && (
										<span className="font-num text-[13.5px] font-semibold text-ink-2 tabular-nums">
											{yen(per)}
										</span>
									)}
									{on && mode === "custom" && (
										<div className="relative w-28">
											<span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 font-num text-[13px] font-bold text-muted-foreground">
												¥
											</span>
											<Input
												inputMode="numeric"
												value={ca(m.id) ? ca(m.id).toLocaleString() : ""}
												onChange={(e) => {
													const v =
														Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
													setCustom((p) => ({ ...p, [m.id]: v }));
												}}
												placeholder="0"
												className="h-9 pr-2 pl-6 text-right font-num text-sm font-bold tabular-nums"
											/>
										</div>
									)}

									<button
										type="button"
										onClick={() => toggle(m.id)}
										aria-label={on ? "選択を外す" : "選択する"}
										className={cn(
											"flex size-[22px] shrink-0 items-center justify-center rounded-md transition-colors",
											on
												? "bg-key text-white"
												: "border-2 border-border text-transparent",
										)}
									>
										{on && <Check className="size-[15px]" />}
									</button>
								</div>
							);
						})}
					</div>

					{mode === "custom" && amount > 0 && (
						<div className="mt-2.5 flex items-center gap-2.5 px-0.5">
							<span className="text-[12.5px] text-ink-2">
								合計{" "}
								<span className="font-num font-bold text-ink">
									{yen(customSum)}
								</span>{" "}
								/ {yen(amount)}
							</span>
							<div className="flex-1" />
							{remaining === 0 ? (
								<span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-pos">
									<Check className="size-[15px]" /> 一致
								</span>
							) : (
								<span className="text-[12.5px] font-bold text-neg">
									{remaining > 0
										? `残り ${yen(remaining)}`
										: `${yen(-remaining)} 超過`}
								</span>
							)}
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={splitEven}
								className="h-7 px-2.5 text-xs text-key"
							>
								均等に
							</Button>
						</div>
					)}
				</FormField>
			</DialogBody>

			<DialogFooter>
				<Button type="button" variant="outline" size="lg" onClick={onClose}>
					キャンセル
				</Button>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button
							type="submit"
							size="lg"
							disabled={isSubmitting || !splitValid}
						>
							{isSubmitting ? "送信中…" : submitLabel}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
