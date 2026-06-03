import { createFileRoute } from "@tanstack/react-router";
import { GroupCreateForm } from "@/features/group/components/group-create-form";

export const Route = createFileRoute("/_authenticated/groups/new")({
	component: NewGroupPage,
});

function NewGroupPage() {
	return (
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				グループをつくる
			</h1>
			<GroupCreateForm />
		</div>
	);
}
