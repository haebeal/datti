import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteRepayment } from "@/features/repayment/mutations";
import { repaymentQueryOptions } from "@/features/repayment/queries";
import { meQueryOptions } from "@/features/user/queries";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/repayments/$id/")({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(repaymentQueryOptions(params.id)),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: RepaymentDetailPage,
});

function RepaymentDetailPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { data: repayment } = useSuspenseQuery(repaymentQueryOptions(id));
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const deleteRepayment = useDeleteRepayment();
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const isPayer = repayment.payer.id === me.id;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
					返した記録
				</h1>
				{isPayer && (
					<Link
						to="/repayments/$id/edit"
						params={{ id }}
						className={cn(
							"flex items-center gap-1 ml-auto",
							"px-3 py-1.5 rounded-md text-sm",
							"border border-primary-base text-primary-base",
							"hover:bg-primary-base hover:text-white",
							"transition-colors",
						)}
					>
						<Pencil className="w-4 h-4" />
						編集
					</Link>
				)}
			</div>

			<div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg bg-white")}>
				<dl className="flex flex-col gap-2">
					<div className="flex justify-between">
						<dt className="text-sm text-gray-500">金額</dt>
						<dd className="font-semibold">{formatCurrency(repayment.amount)}</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-sm text-gray-500">支払い者</dt>
						<dd>{repayment.payer.name}</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-sm text-gray-500">受け取り者</dt>
						<dd>{repayment.debtor.name}</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-sm text-gray-500">日付</dt>
						<dd>{formatDate(repayment.createdAt)}</dd>
					</div>
				</dl>
			</div>

			{isPayer && (
				<div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
					<h2 className="text-lg font-semibold text-error-base">危険な操作</h2>
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
						この返済記録を削除する
					</button>
				</div>
			)}

			<ConfirmDialog
				isOpen={isDeleteOpen}
				onOpenChange={setDeleteOpen}
				title="返済記録を削除しますか？"
				message="削除した記録は元に戻せません。"
				confirmLabel="削除する"
				onConfirm={async () => {
					await deleteRepayment.mutateAsync(id);
					navigate({ to: "/repayments" });
				}}
				isLoading={deleteRepayment.isPending}
			/>
		</div>
	);
}
