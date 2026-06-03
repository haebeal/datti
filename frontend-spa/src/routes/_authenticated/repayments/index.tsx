import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { repaymentsQueryOptions } from "@/features/repayment/queries";
import { meQueryOptions } from "@/features/user/queries";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/repayments/")({
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(repaymentsQueryOptions),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: RepaymentsPage,
});

function RepaymentsPage() {
	const { data: repayments } = useSuspenseQuery(repaymentsQueryOptions);
	const { data: me } = useSuspenseQuery(meQueryOptions);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
					返した記録
				</h1>
				<LinkButton to="/repayments/new" className="ml-auto">
					<Plus className="w-4 h-4" />
					返した記録をつける
				</LinkButton>
			</div>

			{repayments.length === 0 ? (
				<p className="text-center text-gray-500 py-12">
					まだ返済記録がありません
				</p>
			) : (
				<ul className="flex flex-col gap-2">
					{repayments.map((r) => {
						const isPayer = r.payer.id === me.id;
						const counterpart = isPayer ? r.debtor : r.payer;
						return (
							<li key={r.id}>
								<Link
									to="/repayments/$id"
									params={{ id: r.id }}
									className={cn(
										"flex items-center gap-3 p-4",
										"border rounded-lg bg-white",
										"hover:bg-gray-50 transition-colors",
									)}
								>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-primary-base truncate">
											{isPayer ? `${counterpart.name} へ` : `${counterpart.name} から`}
										</p>
										<p className="text-xs text-gray-500">
											{formatDate(r.createdAt)}
										</p>
									</div>
									<span
										className={cn(
											"font-semibold",
											isPayer ? "text-error-base" : "text-success-base",
										)}
									>
										{isPayer ? "-" : "+"}
										{formatCurrency(r.amount)}
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
