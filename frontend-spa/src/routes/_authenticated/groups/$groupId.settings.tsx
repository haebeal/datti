import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/dialog";
import { GroupBasicInfoForm } from "@/features/group/components/group-basic-info-form";
import { MemberPanel } from "@/features/group/components/member-panel";
import { useDeleteGroup } from "@/features/group/mutations";
import {
	groupMembersQueryOptions,
	groupQueryOptions,
} from "@/features/group/queries";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/groups/$groupId/settings")({
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
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				{group.name} の設定
			</h1>

			<GroupBasicInfoForm group={group} />

			<MemberPanel groupId={groupId} />

			<div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
				<h2 className="text-lg font-semibold text-error-base">
					危険な操作
				</h2>
				<p className="text-sm text-gray-600">
					グループを削除すると、関連する立て替え・返済もすべて消えます。
				</p>
				<button
					type="button"
					onClick={() => setDeleteOpen(true)}
					className={cn(
						"px-4 py-2 self-start rounded-md",
						"border border-error-base text-error-base",
						"hover:bg-error-base hover:text-white",
						"transition-colors",
					)}
				>
					グループを削除する
				</button>
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
