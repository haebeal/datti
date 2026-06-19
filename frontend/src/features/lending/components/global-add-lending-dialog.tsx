import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { groupColorFor, Monogram } from "@/components/ui/monogram";
import {
	groupMembersQueryOptions,
	groupsQueryOptions,
} from "@/features/group/queries";
import { LendingForm } from "@/features/lending/components/lending-form";
import { useCreateLending } from "@/features/lending/mutations";
import { meQueryOptions } from "@/features/user/queries";
import { cn } from "@/lib/utils";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

/**
 * グループ選択つきの立て替え追加モーダル。
 * サイドバー/ホームのグローバル CTA から開く (グループ未指定)。
 */
export function GlobalAddLendingDialog({ open, onOpenChange }: Props) {
	const groupsQuery = useQuery({ ...groupsQueryOptions, enabled: open });
	const meQuery = useQuery({ ...meQueryOptions, enabled: open });
	const groups = groupsQuery.data ?? [];

	const [groupId, setGroupId] = useState<string | null>(null);
	useEffect(() => {
		if (open && groups.length > 0 && !groupId) setGroupId(groups[0].id);
	}, [open, groups, groupId]);

	const membersQuery = useQuery({
		...groupMembersQueryOptions(groupId ?? ""),
		enabled: open && !!groupId,
	});
	const createLending = useCreateLending(groupId ?? "");

	const close = (o: boolean) => {
		if (!o) setGroupId(null);
		onOpenChange(o);
	};

	return (
		<Dialog open={open} onOpenChange={close}>
			<DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>立て替えを追加</DialogTitle>
				</DialogHeader>

				{groupsQuery.isSuccess && groups.length === 0 ? (
					<div className="flex flex-col items-start gap-3 py-4 text-sm text-muted-foreground">
						まず立て替えを記録するグループが必要です。
						<Link
							to="/groups/new"
							onClick={() => onOpenChange(false)}
							className="font-semibold text-primary hover:underline"
						>
							グループをつくる →
						</Link>
					</div>
				) : (
					<>
						{/* グループ選択 */}
						<div>
							<div className="mb-2 text-xs font-semibold text-foreground">
								グループ
							</div>
							<div className="flex flex-wrap gap-2">
								{groups.map((g) => {
									const on = g.id === groupId;
									return (
										<button
											type="button"
											key={g.id}
											onClick={() => setGroupId(g.id)}
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

						{groupId && membersQuery.data && meQuery.data ? (
							<LendingForm
								key={groupId}
								members={membersQuery.data}
								currentUserId={meQuery.data.id}
								submitLabel="この内容で記録する"
								onSubmit={async (values) => {
									await createLending.mutateAsync(values);
									close(false);
								}}
							/>
						) : (
							<div className="py-6 text-center text-sm text-muted-foreground">
								読み込み中…
							</div>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
