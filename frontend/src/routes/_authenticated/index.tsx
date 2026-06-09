import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { creditsQueryOptions } from "@/features/credit/queries";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(creditsQueryOptions()),
	component: DashboardPage,
});

function DashboardPage() {
	const { data: credits } = useSuspenseQuery(creditsQueryOptions());

	const lent = credits.filter((c) => c.amount > 0);
	const borrowed = credits.filter((c) => c.amount < 0);

	return (
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				ホーム
			</h1>

			<section className={cn("flex flex-col gap-3")}>
				<h2 className="text-lg font-semibold text-primary-base">
					返してもらう
				</h2>
				{lent.length === 0 ? (
					<p className="text-sm text-gray-500 p-4 border rounded-lg bg-white">
						貸している相手はいません
					</p>
				) : (
					<ul className="flex flex-col gap-2">
						{lent.map((credit) => (
							<li
								key={credit.user.id}
								className={cn(
									"flex items-center gap-3 p-4",
									"border rounded-lg bg-white",
								)}
							>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-primary-base truncate">
										{credit.user.name}
									</p>
								</div>
								<span className="font-semibold text-success-base">
									+{formatCurrency(credit.amount)}
								</span>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className={cn("flex flex-col gap-3")}>
				<h2 className="text-lg font-semibold text-primary-base">返す</h2>
				{borrowed.length === 0 ? (
					<p className="text-sm text-gray-500 p-4 border rounded-lg bg-white">
						返す相手はいません
					</p>
				) : (
					<ul className="flex flex-col gap-2">
						{borrowed.map((credit) => (
							<li key={credit.user.id}>
								<Link
									to="/repayments/new"
									search={{
										debtorId: credit.user.id,
										amount: Math.abs(credit.amount),
									}}
									className={cn(
										"flex items-center gap-3 p-4",
										"border rounded-lg bg-white",
										"hover:bg-gray-50 transition-colors",
									)}
								>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-primary-base truncate">
											{credit.user.name}
										</p>
										<p className="text-xs text-gray-500">
											タップして返した記録をつける
										</p>
									</div>
									<span className="font-semibold text-error-base">
										-{formatCurrency(Math.abs(credit.amount))}
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
