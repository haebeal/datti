import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { PageHead } from "@/components/ui/page-head";
import { Panel, PanelHead } from "@/components/ui/panel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { creditsQueryOptions } from "@/features/credit/queries";
import { GlobalAddLendingDialog } from "@/features/lending/components/global-add-lending-dialog";
import { RepayDialog } from "@/features/repayment/components/repay-dialog";

export const Route = createFileRoute("/_authenticated/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(creditsQueryOptions()),
	component: DashboardPage,
});

function Empty({ children }: { children: ReactNode }) {
	return (
		<div className="px-5 py-6 text-center text-[13.5px] text-muted-foreground">
			{children}
		</div>
	);
}

function DashboardPage() {
	const { data: credits } = useSuspenseQuery(creditsQueryOptions());

	const [repayTarget, setRepayTarget] = useState<{
		debtorId: string;
		amount: number;
	} | null>(null);
	const [addOpen, setAddOpen] = useState(false);

	const lent = credits.filter((c) => c.amount > 0);
	const borrowed = credits.filter((c) => c.amount < 0);
	const totalLent = lent.reduce((s, c) => s + c.amount, 0);
	const totalBorrowed = borrowed.reduce((s, c) => s + Math.abs(c.amount), 0);
	const net = totalLent - totalBorrowed;

	return (
		<div>
			<PageHead
				title="ホーム"
				sub="あなたの貸し借りの全体状況"
				right={
					<Button size="lg" onClick={() => setAddOpen(true)}>
						<Plus className="size-[18px]" /> 立て替えを追加
					</Button>
				}
			/>

			{/* 差し引き残高 hero */}
			<Panel className="mb-[22px] flex items-stretch overflow-hidden">
				<div className="flex-[1.4] px-7 py-6">
					<div className="mb-1.5 text-[13px] text-muted-foreground">
						差し引き残高
					</div>
					<Money
						value={net}
						signed
						colored
						className="text-[52px] leading-none tracking-[-0.03em]"
					/>
					<div className="mt-2.5 text-[13.5px] text-ink-2">
						{net >= 0
							? "受け取る金額の方が多くなっています"
							: "支払う金額の方が多くなっています"}
					</div>
				</div>
				<div className="w-px bg-hair" />
				<div className="flex flex-1 flex-col justify-center gap-[18px] px-7 py-6">
					<div>
						<div className="mb-1.5 flex items-center gap-1.5 text-pos">
							<ArrowDown className="size-[15px]" />
							<span className="text-[12.5px] text-ink-2">返してもらう</span>
						</div>
						<Money value={totalLent} className="text-2xl" />
					</div>
					<div>
						<div className="mb-1.5 flex items-center gap-1.5 text-neg">
							<ArrowUp className="size-[15px]" />
							<span className="text-[12.5px] text-ink-2">返す</span>
						</div>
						<Money value={totalBorrowed} className="text-2xl" />
					</div>
				</div>
			</Panel>

			{/* 返してもらう / 返す */}
			<div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-2">
				<Panel>
					<PanelHead count={lent.length}>返してもらう</PanelHead>
					{lent.length === 0 ? (
						<Empty>貸している相手はいません</Empty>
					) : (
						lent.map((c) => (
							<div
								key={c.user.id}
								className="flex items-center gap-3 border-b border-hair px-5 py-3 last:border-b-0"
							>
								<UserAvatar user={c.user} className="size-10" />
								<span className="flex-1 truncate text-[14.5px] font-semibold text-foreground">
									{c.user.name}
								</span>
								<Money value={c.amount} signed colored className="text-base" />
							</div>
						))
					)}
				</Panel>

				<Panel>
					<PanelHead count={borrowed.length}>返す</PanelHead>
					<div className="px-5 pt-2.5 text-[11.5px] text-muted-foreground">
						グループに関係なく、相手ごとにまとめて返せます
					</div>
					{borrowed.length === 0 ? (
						<Empty>返す相手はいません</Empty>
					) : (
						borrowed.map((c) => (
							<div
								key={c.user.id}
								className="flex items-center gap-3 border-b border-hair px-5 py-[11px] last:border-b-0"
							>
								<UserAvatar user={c.user} className="size-10" />
								<span className="flex-1 truncate text-[14.5px] font-semibold text-foreground">
									{c.user.name}
								</span>
								<Money value={c.amount} signed colored className="text-base" />
								<Button
									variant="outline"
									size="sm"
									className="text-primary"
									onClick={() =>
										setRepayTarget({
											debtorId: c.user.id,
											amount: Math.abs(c.amount),
										})
									}
								>
									返す
								</Button>
							</div>
						))
					)}
				</Panel>
			</div>

			<RepayDialog
				open={!!repayTarget}
				onOpenChange={(o) => {
					if (!o) setRepayTarget(null);
				}}
				credits={credits}
				debtorId={repayTarget?.debtorId}
				amount={repayTarget?.amount}
			/>

			<GlobalAddLendingDialog open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
}
