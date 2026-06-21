import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ListGroup, ListRow } from "@/components/ui/list-group";
import { Money } from "@/components/ui/money";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { GroupMember } from "@/features/group/types";
import { useDeleteLending } from "@/features/lending/mutations";
import { formatMonthDay } from "@/utils/format";

type LendingLike = {
	id: string;
	name: string;
	eventDate: string;
	createdBy: string;
	debts: { userId: string; amount: number }[];
};

type Props = {
	lending: LendingLike | null;
	members: GroupMember[];
	meId: string;
	groupId: string;
	onClose: () => void;
};

/** 立て替えの詳細モーダル。一覧の lending データを受け取り追加フェッチしない。 */
export function LendingDetailDialog({
	lending,
	members,
	meId,
	groupId,
	onClose,
}: Props) {
	const deleteLending = useDeleteLending(groupId);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const memberMap = new Map(members.map((m) => [m.id, m]));
	const payer = lending ? memberMap.get(lending.createdBy) : undefined;
	const isPayer = lending?.createdBy === meId;
	const total = lending ? lending.debts.reduce((s, d) => s + d.amount, 0) : 0;

	return (
		<Dialog
			open={!!lending}
			onOpenChange={(o) => {
				if (!o) onClose();
			}}
		>
			<DialogContent className="sm:max-w-[480px]">
				{lending && (
					<>
						<DialogHeader>
							<DialogTitle>立て替えの詳細</DialogTitle>
						</DialogHeader>

						<div className="text-center">
							<div className="mb-1.5 text-[13.5px] text-muted-foreground">
								{lending.name}
							</div>
							<Money value={total} className="text-[40px] tracking-[-0.03em]" />
							<div className="mt-3 inline-flex items-center gap-2">
								{payer ? (
									<UserAvatar user={payer} className="size-6 text-xs" />
								) : null}
								<span className="text-[13px] text-ink-2">
									{isPayer ? "あなた" : (payer?.name ?? "メンバー")}
									が立て替えました
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-border px-4 py-3.5">
							<div className="mb-1 text-[11.5px] text-muted-foreground">
								日付
							</div>
							<div className="text-[14.5px] font-semibold text-foreground">
								{formatMonthDay(lending.eventDate)}
							</div>
						</div>

						<div>
							<div className="mb-2.5 font-heading text-[13px] font-bold text-ink-2">
								内訳
							</div>
							<ListGroup>
								{lending.debts.map((d, i) => {
									const u = memberMap.get(d.userId);
									const isMe = d.userId === meId;
									return (
										<ListRow
											key={d.userId}
											last={i === lending.debts.length - 1}
										>
											{u ? (
												<UserAvatar user={u} className="size-9 text-sm" />
											) : (
												<div className="size-9 shrink-0 rounded-full bg-muted" />
											)}
											<span
												className={`flex-1 text-[14.5px] ${isMe ? "font-bold" : "font-medium"} text-foreground`}
											>
												{isMe ? "あなた" : (u?.name ?? d.userId)}
											</span>
											<Money value={d.amount} className="text-[15px]" />
										</ListRow>
									);
								})}
							</ListGroup>
						</div>

						{isPayer && (
							<DialogFooter className="sm:justify-between">
								<Button asChild variant="outline">
									<Link
										to="/groups/$groupId/lendings/$lendingId/edit"
										params={{ groupId, lendingId: lending.id }}
									>
										<Pencil className="size-4" /> 編集
									</Link>
								</Button>
								<Button
									variant="destructive"
									onClick={() => setConfirmOpen(true)}
								>
									この立て替えを削除する
								</Button>
							</DialogFooter>
						)}

						<ConfirmDialog
							isOpen={confirmOpen}
							onOpenChange={setConfirmOpen}
							title="立て替えを削除しますか？"
							message={`「${lending.name}」を削除します。元には戻せません。`}
							confirmLabel="削除する"
							onConfirm={async () => {
								await deleteLending.mutateAsync(lending.id);
								onClose();
							}}
							isLoading={deleteLending.isPending}
						/>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
