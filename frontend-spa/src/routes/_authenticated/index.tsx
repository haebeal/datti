import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
	component: DashboardPage,
});

function DashboardPage() {
	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-2xl font-bold text-primary-base">ホーム</h1>
			<p className="text-primary-base">ダッシュボードは Phase 3 で実装します。</p>
		</div>
	);
}
