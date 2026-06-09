import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { groupQueryOptions } from "@/features/group/queries";
import { lendingsByGroupQueryOptions } from "@/features/lending/queries";
import { meQueryOptions } from "@/features/user/queries";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export const Route = createFileRoute(
	"/_authenticated/groups/$groupId/lendings/",
)({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(groupQueryOptions(params.groupId)),
			context.queryClient.ensureQueryData(
				lendingsByGroupQueryOptions(params.groupId),
			),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: LendingsListPage,
});

function LendingsListPage() {
	const { groupId } = Route.useParams();
	const { data: group } = useSuspenseQuery(groupQueryOptions(groupId));
	const { data: paginated } = useSuspenseQuery(
		lendingsByGroupQueryOptions(groupId),
	);
	const { data: me } = useSuspenseQuery(meQueryOptions);

	const lendings = paginated.lendings ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
					{group.name} の立て替え
				</h1>
				<LinkButton
					to="/groups/$groupId/lendings/new"
					params={{ groupId }}
					className="ml-auto"
				>
					<Plus className="w-4 h-4" />
					立て替えを追加
				</LinkButton>
			</div>

			{lendings.length === 0 ? (
				<p className="text-center text-gray-500 py-12">
					まだ立て替えがありません
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{lendings.map((lending) => {
						const isPayer = lending.createdBy === me.id;
						const totalDebt = lending.debts.reduce(
							(s, d) => s + d.amount,
							0,
						);
						const myDebt = lending.debts.find((d) => d.userId === me.id);
						const myAmount = isPayer ? totalDebt : myDebt ? -myDebt.amount : 0;
						return (
							<li key={lending.id}>
								<Link
									to="/groups/$groupId/lendings/$lendingId"
									params={{ groupId, lendingId: lending.id }}
									className={cn(
										"flex items-center gap-3",
										"p-4",
										"border rounded-lg bg-white",
										"hover:bg-gray-50 transition-colors",
									)}
								>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-primary-base truncate">
											{lending.name}
										</p>
										<p className="text-xs text-gray-500">
											{formatDate(lending.eventDate)} ・ メンバー{" "}
											{lending.debts.length}人
										</p>
									</div>
									<span
										className={cn(
											"font-semibold",
											myAmount < 0
												? "text-error-base"
												: myAmount > 0
													? "text-success-base"
													: "text-gray-500",
										)}
									>
										{myAmount > 0 ? "+" : ""}¥{myAmount.toLocaleString()}
									</span>
									<ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
