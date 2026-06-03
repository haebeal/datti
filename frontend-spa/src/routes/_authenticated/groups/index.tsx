import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { groupsQueryOptions } from "@/features/group/queries";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/groups/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions),
	component: GroupsPage,
});

function GroupsPage() {
	const { data: groups } = useSuspenseQuery(groupsQueryOptions);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
					グループ
				</h1>
				<LinkButton
					to="/groups/new"
					color="primary"
					className="ml-auto"
				>
					<Plus className="w-4 h-4" />
					新規作成
				</LinkButton>
			</div>

			{groups.length === 0 ? (
				<p className="text-center text-gray-500 py-12">
					まだグループがありません
				</p>
			) : (
				<ul className="flex flex-col gap-2">
					{groups.map((group) => (
						<li key={group.id}>
							<Link
								to="/groups/$groupId/lendings"
								params={{ groupId: group.id }}
								className={cn(
									"flex items-center gap-3",
									"p-4",
									"border rounded-lg bg-white",
									"hover:bg-gray-50 transition-colors",
								)}
							>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-primary-base truncate">
										{group.name}
									</p>
									<p className="text-xs text-gray-500">
										作成: {formatDate(group.createdAt)} ・ {group.creator.name}
									</p>
								</div>
								<ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
