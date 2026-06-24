import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GroupBasicInfoForm } from "@/features/group/components/group-basic-info-form";
import { useDeleteGroup } from "@/features/group/mutations";
import type { Group } from "@/features/group/types";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group;
};

/** グループ設定モーダル（名前変更＋削除）。メンバー管理は MembersDialog が担当する。 */
export function GroupSettingsDialog({ open, onOpenChange, group }: Props) {
	const navigate = useNavigate();
	const deleteGroup = useDeleteGroup();
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const handleDelete = async () => {
		await deleteGroup.mutateAsync(group.id);
		navigate({ to: "/groups" });
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle>グループの設定</DialogTitle>
					</DialogHeader>
					<DialogBody className="flex flex-col gap-6">
						<GroupBasicInfoForm group={group} />

						<div>
							<h3 className="mb-2 font-heading text-[13px] font-bold text-destructive">
								危険な操作
							</h3>
							<div className="flex items-center gap-4 rounded-xl border border-destructive p-4">
								<div className="min-w-0 flex-1">
									<div className="text-sm font-bold text-foreground">
										グループを削除
									</div>
									<p className="mt-0.5 text-xs text-muted-foreground">
										立て替えと精算履歴がすべて消えます。
									</p>
								</div>
								<Button
									variant="destructive"
									onClick={() => setDeleteOpen(true)}
								>
									削除
								</Button>
							</div>
						</div>
					</DialogBody>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				isOpen={isDeleteOpen}
				onOpenChange={setDeleteOpen}
				title="グループを削除しますか？"
				message={`「${group.name}」を削除します。元には戻せません。`}
				confirmLabel="削除する"
				onConfirm={handleDelete}
				isLoading={deleteGroup.isPending}
			/>
		</>
	);
}
