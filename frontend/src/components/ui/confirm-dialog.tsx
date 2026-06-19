import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	isLoading?: boolean;
};

/** 削除などの確認モーダル。shadcn alert-dialog ベース。 */
export function ConfirmDialog({
	isOpen,
	onOpenChange,
	title,
	message,
	confirmLabel = "削除する",
	cancelLabel = "キャンセル",
	onConfirm,
	isLoading = false,
}: ConfirmDialogProps) {
	return (
		<AlertDialog open={isOpen} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{message}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button
						variant="outline"
						disabled={isLoading}
						onClick={() => onOpenChange(false)}
					>
						{cancelLabel}
					</Button>
					<Button
						disabled={isLoading}
						className="bg-destructive text-white hover:bg-destructive/90"
						onClick={() => {
							onConfirm();
							onOpenChange(false);
						}}
					>
						{confirmLabel}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
