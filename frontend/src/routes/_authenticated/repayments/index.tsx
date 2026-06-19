import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { PageHead } from "@/components/ui/page-head";
import { Panel, PanelHead } from "@/components/ui/panel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { repaymentsQueryOptions } from "@/features/repayment/queries";
import { meQueryOptions } from "@/features/user/queries";
import { formatMonthDay } from "@/utils/format";

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

	const total = repayments.reduce((s, r) => s + r.amount, 0);

	return (
		<div>
			<PageHead
				title="返した記録"
				sub="人ごとに、グループをまたいで精算した履歴"
				right={
					<Button asChild size="lg">
						<Link to="/repayments/new">
							<Plus className="size-[18px]" /> 返した記録をつける
						</Link>
					</Button>
				}
			/>

			<div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-[1fr_300px]">
				<Panel>
					<PanelHead count={repayments.length}>返済履歴</PanelHead>
					{repayments.length === 0 ? (
						<div className="px-5 py-10 text-center text-[13.5px] text-muted-foreground">
							まだ返済記録がありません
						</div>
					) : (
						<>
							{repayments.map((r) => {
								const isPayer = r.payer.id === me.id;
								const counterpart = isPayer ? r.debtor : r.payer;
								return (
									<Link
										key={r.id}
										to="/repayments/$id"
										params={{ id: r.id }}
										className="flex items-center gap-3 border-b border-hair px-5 py-3.5 transition-colors last:border-b-0 hover:bg-secondary"
									>
										<UserAvatar user={counterpart} className="size-10" />
										<div className="min-w-0 flex-1">
											<div className="truncate text-[15px] font-semibold text-foreground">
												{counterpart.name}
											</div>
											<div className="mt-0.5 text-[11.5px] text-muted-foreground">
												{formatMonthDay(r.createdAt)}に
												{isPayer ? "返済" : "受取"}
											</div>
										</div>
										<span className="inline-flex items-center gap-1.5">
											<Check className="size-4 text-pos" />
											<Money value={r.amount} className="text-base" />
										</span>
									</Link>
								);
							})}
							<div className="py-[18px] text-center text-xs text-muted-foreground">
								これより前の記録はありません
							</div>
						</>
					)}
				</Panel>

				<Panel className="p-[22px] lg:sticky lg:top-0">
					<div className="mb-1.5 text-[12.5px] text-muted-foreground">
						返済した合計
					</div>
					<Money value={total} className="text-[32px]" />
					<div className="mt-1 text-[12.5px] text-ink-2">
						{repayments.length}件の返済
					</div>
					<Button asChild variant="outline" className="mt-[18px] w-full">
						<Link to="/">返す相手を確認</Link>
					</Button>
				</Panel>
			</div>
		</div>
	);
}
