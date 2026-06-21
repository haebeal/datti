import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHead } from "@/components/ui/page-head";
import { Panel } from "@/components/ui/panel";
import { GroupBasicInfoForm } from "@/features/group/components/group-basic-info-form";
import { MemberPanel } from "@/features/group/components/member-panel";
import { useDeleteGroup } from "@/features/group/mutations";
import {
	groupMembersQueryOptions,
	groupQueryOptions,
} from "@/features/group/queries";

export const Route = createFileRoute(
	"/_authenticated/groups/$groupId/settings",
)({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(groupQueryOptions(params.groupId)),
			context.queryClient.ensureQueryData(
				groupMembersQueryOptions(params.groupId),
			),
		]);
	},
	component: GroupSettingsPage,
});

function GroupSettingsPage() {
	const { groupId } = Route.useParams();
	const navigate = useNavigate();
	const { data: group } = useSuspenseQuery(groupQueryOptions(groupId));
	const deleteGroup = useDeleteGroup();
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const handleDelete = async () => {
		await deleteGroup.mutateAsync(groupId);
		navigate({ to: "/groups" });
	};

	return (
		<div className="mx-auto max-w-[640px]">
			<PageHead title={`${group.name} の設定`} />

			<div className="flex flex-col gap-[22px]">
				<GroupBasicInfoForm group={group} />

				<Panel className="p-6">
					<h2 className="mb-4 font-heading text-[17px] font-bold text-foreground">
						メンバー
					</h2>
					<MemberPanel groupId={groupId} />
				</Panel>

				<Panel className="p-6">
					<h2 className="mb-2 font-heading text-[17px] font-bold text-destructive">
						危険な操作
					</h2>
					<p className="mb-3 text-sm text-muted-foreground">
						グループを削除すると、関連する立て替え・返済もすべて消えます。
					</p>
					<Button variant="destructive" onClick={() => setDeleteOpen(true)}>
						グループを削除する
					</Button>
				</Panel>
			</div>

			<ConfirmDialog
				isOpen={isDeleteOpen}
				onOpenChange={setDeleteOpen}
				title="グループを削除しますか？"
				message={`「${group.name}」を削除します。元には戻せません。`}
				confirmLabel="削除する"
				onConfirm={handleDelete}
				isLoading={deleteGroup.isPending}
			/>
		</div>
	);
}
