import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GroupCreateForm } from "@/features/group/components/group-create-form";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

/** グループ作成モーダル。作成後はグループ詳細へ遷移しつつモーダルを閉じる。 */
export function GroupCreateDialog({ open, onOpenChange }: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[460px]">
				<DialogHeader>
					<DialogTitle>グループをつくる</DialogTitle>
				</DialogHeader>
				<DialogBody className="flex flex-col gap-4">
					<GroupCreateForm onSuccess={() => onOpenChange(false)} />
					<p className="text-xs text-muted-foreground">
						作成後、メンバーを追加できます。
					</p>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
