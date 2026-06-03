import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-2xl font-bold text-primary-base">マイページ</h1>
			<p className="text-primary-base">Phase 3-4 で実装します。</p>
		</div>
	);
}
