import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { MemberPanel } from "@/features/group/components/member-panel";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	groupId: string;
	groupName: string;
};

/** メンバー管理モーダル。既存の MemberPanel を再利用。 */
export function MembersDialog({
	open,
	onOpenChange,
	groupId,
	groupName,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{groupName} のメンバー</DialogTitle>
				</DialogHeader>
				<MemberPanel groupId={groupId} />
			</DialogContent>
		</Dialog>
	);
}
