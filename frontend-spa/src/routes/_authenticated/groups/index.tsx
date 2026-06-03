import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/groups/")({
	component: GroupsPage,
});

function GroupsPage() {
	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-2xl font-bold text-primary-base">グループ</h1>
			<p className="text-primary-base">Phase 3-1 で実装します。</p>
		</div>
	);
}
