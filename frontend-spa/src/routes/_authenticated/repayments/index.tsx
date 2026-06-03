import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/repayments/")({
	component: RepaymentsPage,
});

function RepaymentsPage() {
	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-2xl font-bold text-primary-base">返した記録</h1>
			<p className="text-primary-base">Phase 3-3 で実装します。</p>
		</div>
	);
}
