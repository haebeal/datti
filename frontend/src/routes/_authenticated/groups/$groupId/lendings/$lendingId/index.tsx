import { useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
	groupMembersQueryOptions,
} from "@/features/group/queries";
import {
	useDeleteLending,
} from "@/features/lending/mutations";
import { lendingQueryOptions } from "@/features/lending/queries";
import { meQueryOptions } from "@/features/user/queries";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/groups/$groupId/lendings/$lendingId/",
)({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				lendingQueryOptions(params.groupId, params.lendingId),
			),
			context.queryClient.ensureQueryData(
				groupMembersQueryOptions(params.groupId),
			),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: LendingDetailPage,
});

function LendingDetailPage() {
	const { groupId, lendingId } = Route.useParams();
	const navigate = useNavigate();
	const { data: lending } = useSuspenseQuery(
		lendingQueryOptions(groupId, lendingId),
	);
	const { data: members } = useSuspenseQuery(
		groupMembersQueryOptions(groupId),
	);
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const deleteLending = useDeleteLending(groupId);
	const [isDeleteOpen, setDeleteOpen] = useState(false);

	const memberMap = new Map(members.map((m) => [m.id, m]));
	const payer = memberMap.get(lending.createdBy);
	const isPayer = lending.createdBy === me.id;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
					{lending.name}
				</h1>
				{isPayer && (
					<Link
						to="/groups/$groupId/lendings/$lendingId/edit"
						params={{ groupId, lendingId }}
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
						<dd className="font-semibold">
							{formatCurrency(lending.amount)}
						</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-sm text-gray-500">日付</dt>
						<dd>{formatDate(lending.eventDate)}</dd>
					</div>
					<div className="flex justify-between">
						<dt className="text-sm text-gray-500">支払い者</dt>
						<dd>{payer ? payer.name : "不明"}</dd>
					</div>
				</dl>
			</div>

			<div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg bg-white")}>
				<h2 className="font-semibold">内訳</h2>
				<ul className="flex flex-col gap-2">
					{lending.debts.map((debt) => {
						const debtor = memberMap.get(debt.userId);
						return (
							<li
								key={debt.userId}
								className="flex items-center justify-between py-2 border-b last:border-b-0"
							>
								<span>{debtor ? debtor.name : debt.userId}</span>
								<span className="font-semibold">
									{formatCurrency(debt.amount)}
								</span>
							</li>
						);
					})}
				</ul>
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
						この立て替えを削除する
					</button>
				</div>
			)}

			<ConfirmDialog
				isOpen={isDeleteOpen}
				onOpenChange={setDeleteOpen}
				title="立て替えを削除しますか？"
				message={`「${lending.name}」を削除します。元には戻せません。`}
				confirmLabel="削除する"
				onConfirm={async () => {
					await deleteLending.mutateAsync(lendingId);
					navigate({
						to: "/groups/$groupId/lendings",
						params: { groupId },
					});
				}}
				isLoading={deleteLending.isPending}
			/>
		</div>
	);
}
