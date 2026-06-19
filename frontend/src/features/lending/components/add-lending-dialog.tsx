import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { GroupMember } from "@/features/group/types";
import { LendingForm } from "@/features/lending/components/lending-form";
import { useCreateLending } from "@/features/lending/mutations";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	groupId: string;
	members: GroupMember[];
	currentUserId: string;
};

/** 立て替えを追加するモーダル。既存の LendingForm を再利用。 */
export function AddLendingDialog({
	open,
	onOpenChange,
	groupId,
	members,
	currentUserId,
}: Props) {
	const createLending = useCreateLending(groupId);
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[560px]">
				<DialogHeader>
					<DialogTitle>立て替えを追加</DialogTitle>
				</DialogHeader>
				<LendingForm
					members={members}
					currentUserId={currentUserId}
					submitLabel="この内容で記録する"
					onSubmit={async (values) => {
						await createLending.mutateAsync(values);
						onOpenChange(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
