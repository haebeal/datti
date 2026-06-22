import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Credit } from "@/features/credit/types";
import { RepaymentCreateForm } from "@/features/repayment/components/repayment-create-form";
import { useCreateRepayment } from "@/features/repayment/mutations";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	credits: Credit[];
	debtorId?: string;
	amount?: number;
};

/** 返済を記録するモーダル。既存の RepaymentCreateForm を再利用。 */
export function RepayDialog({
	open,
	onOpenChange,
	credits,
	debtorId,
	amount,
}: Props) {
	const createRepayment = useCreateRepayment();
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle>返済を記録</DialogTitle>
					<DialogDescription>
						グループに関係なく、相手ごとにまとめて精算します
					</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<RepaymentCreateForm
						credits={credits}
						defaultDebtorId={debtorId}
						defaultAmount={amount}
						onSubmit={async (values) => {
							await createRepayment.mutateAsync(values);
							onOpenChange(false);
						}}
					/>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
