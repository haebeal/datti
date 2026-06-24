import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Plus, Settings, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { groupColorFor, Monogram } from "@/components/ui/monogram";
import { Panel, PanelHead } from "@/components/ui/panel";
import { AvatarStack, UserAvatar } from "@/components/ui/user-avatar";
import { GroupSettingsDialog } from "@/features/group/components/group-settings-dialog";
import { MembersDialog } from "@/features/group/components/members-dialog";
import {
	groupMembersQueryOptions,
	groupQueryOptions,
} from "@/features/group/queries";
import { CreateLendingDialog } from "@/features/lending/components/create-lending-dialog";
import {
	EditLendingDialog,
	type LendingForEdit,
} from "@/features/lending/components/edit-lending-dialog";
import { LendingDetailDialog } from "@/features/lending/components/lending-detail-dialog";
import { lendingsByGroupQueryOptions } from "@/features/lending/queries";
import { meQueryOptions } from "@/features/user/queries";
import { formatMonthDay } from "@/utils/format";

/** グループ詳細 (ヘッダー＋残高＋立て替え一覧)。master/detail と直リンクルートで共用。 */
export function GroupDetailView({ groupId }: { groupId: string }) {
	const { data: group } = useSuspenseQuery(groupQueryOptions(groupId));
	const { data: members } = useSuspenseQuery(groupMembersQueryOptions(groupId));
	const {
		data: lendingPages,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useSuspenseInfiniteQuery(lendingsByGroupQueryOptions(groupId));
	const { data: me } = useSuspenseQuery(meQueryOptions);

	const lendings = lendingPages.pages.flatMap((p) => p.lendings ?? []);
	const memberMap = new Map(members.map((m) => [m.id, m]));
	const [detail, setDetail] = useState<(typeof lendings)[number] | null>(null);
	const [editTarget, setEditTarget] = useState<LendingForEdit | null>(null);
	const [addOpen, setAddOpen] = useState(false);
	const [membersOpen, setMembersOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	const myAmountOf = (l: (typeof lendings)[number]) => {
		const total = l.debts.reduce((s, d) => s + d.amount, 0);
		const myDebt = l.debts.find((d) => d.userId === me.id);
		const isPayer = l.createdBy === me.id;
		return isPayer
			? total - (myDebt?.amount ?? 0)
			: myDebt
				? -myDebt.amount
				: 0;
	};

	return (
		<div className="flex flex-col gap-[22px]">
			{/* グループヘッダー */}
			<Panel className="px-6 py-[22px]">
				<div className="flex items-center gap-4">
					<Monogram
						label={group.name.charAt(0)}
						color={groupColorFor(group.id)}
						className="size-14 text-2xl"
					/>
					<div className="min-w-0 flex-1">
						<div className="truncate font-heading text-[22px] font-extrabold tracking-tight text-foreground">
							{group.name}
						</div>
						<div className="mt-1.5 flex items-center gap-2.5">
							<AvatarStack users={members} max={6} />
							<span className="text-[12.5px] text-muted-foreground">
								{members.length}人
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => setMembersOpen(true)}>
							<Users className="size-[17px]" /> メンバー
						</Button>
						<Button
							variant="outline"
							size="icon"
							aria-label="グループの設定"
							title="グループの設定"
							onClick={() => setSettingsOpen(true)}
						>
							<Settings className="size-[18px]" />
						</Button>
					</div>
				</div>
			</Panel>

			{/* 立て替え一覧 */}
			<Panel>
				<PanelHead
					count={lendings.length}
					action={
						<Button
							size="sm"
							className="text-xs"
							onClick={() => setAddOpen(true)}
						>
							<Plus className="size-4" /> 追加
						</Button>
					}
				>
					立て替え
				</PanelHead>
				{lendings.length === 0 ? (
					<div className="px-5 py-6 text-center text-[13.5px] text-muted-foreground">
						まだ立て替えがありません
					</div>
				) : (
					<>
						{lendings.map((l) => {
							const payer = memberMap.get(l.createdBy);
							const isPayer = l.createdBy === me.id;
							const total = l.debts.reduce((s, d) => s + d.amount, 0);
							return (
								<button
									type="button"
									key={l.id}
									onClick={() => setDetail(l)}
									className="flex w-full items-center gap-3 border-b border-hair px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-secondary"
								>
									{payer ? (
										<UserAvatar user={payer} className="size-10" />
									) : (
										<div className="size-10 shrink-0 rounded-full bg-muted" />
									)}
									<div className="min-w-0 flex-1">
										<div className="truncate text-[14.5px] font-semibold text-foreground">
											{l.name}
										</div>
										<div className="mt-0.5 text-[11.5px] text-muted-foreground">
											{formatMonthDay(l.eventDate)} ·{" "}
											{isPayer ? "あなた" : (payer?.name ?? "メンバー")}が立替
										</div>
									</div>
									<div className="text-right">
										<Money
											value={myAmountOf(l)}
											signed
											colored
											className="text-[15px]"
										/>
										<Money
											value={total}
											className="mt-0.5 block text-[10.5px] font-normal text-muted-foreground"
										/>
									</div>
								</button>
							);
						})}
						{hasNextPage && (
							<div className="border-t border-hair p-3">
								<Button
									variant="outline"
									className="w-full"
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
								>
									{isFetchingNextPage ? "読み込み中…" : "もっと見る"}
								</Button>
							</div>
						)}
					</>
				)}
			</Panel>

			<LendingDetailDialog
				lending={detail}
				members={members}
				meId={me.id}
				groupId={groupId}
				onClose={() => setDetail(null)}
				onEdit={(l) => {
					setDetail(null);
					setEditTarget(l);
				}}
			/>

			<CreateLendingDialog
				open={addOpen}
				onOpenChange={setAddOpen}
				groupId={groupId}
			/>

			<EditLendingDialog
				lending={editTarget}
				groupId={groupId}
				onClose={() => setEditTarget(null)}
			/>

			<MembersDialog
				open={membersOpen}
				onOpenChange={setMembersOpen}
				groupId={groupId}
				groupName={group.name}
			/>

			<GroupSettingsDialog
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
				group={group}
			/>
		</div>
	);
}
