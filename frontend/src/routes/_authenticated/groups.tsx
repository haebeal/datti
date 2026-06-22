import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	Outlet,
	createFileRoute,
	useLocation,
} from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Monogram, groupColorFor } from "@/components/ui/monogram";
import { PageHead } from "@/components/ui/page-head";
import { Panel } from "@/components/ui/panel";
import {
	groupMembersQueryOptions,
	groupsQueryOptions,
} from "@/features/group/queries";

export const Route = createFileRoute("/_authenticated/groups")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(groupsQueryOptions),
	component: GroupsLayout,
});

function GroupsLayout() {
	const { pathname } = useLocation();
	const { data: groups } = useSuspenseQuery(groupsQueryOptions);

	const memberQueries = useQueries({
		queries: groups.map((g) => groupMembersQueryOptions(g.id)),
	});

	// マスターリスト＋詳細を出すのは一覧(/groups)とグループ詳細(/groups/$id/lendings)のみ。
	// フォーム系(new/settings/立て替え詳細)は全幅で表示する。
	const showMaster =
		/^\/groups\/?$/.test(pathname) ||
		/^\/groups\/[^/]+\/lendings\/?$/.test(pathname);
	const selectedId =
		pathname.match(/^\/groups\/([^/]+)\/lendings/)?.[1] ?? null;

	if (!showMaster) return <Outlet />;

	return (
		<div>
			<PageHead
				title="グループ"
				sub="旅行・シェアハウスなど、共有の精算"
				right={
					<Button asChild size="lg">
						<Link to="/groups/new">
							<Plus className="size-[18px]" /> 新規作成
						</Link>
					</Button>
				}
			/>

			{groups.length === 0 ? (
				<div className="rounded-[16px] border border-border bg-card px-6 py-12 text-center text-[13.5px] text-muted-foreground">
					まだグループがありません
				</div>
			) : (
				<div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-[320px_1fr]">
					<Panel className="p-1.5">
						{groups.map((group, i) => {
							const on = group.id === selectedId;
							const memberCount = memberQueries[i].data?.length;
							return (
								<Link
									key={group.id}
									to="/groups/$groupId/lendings"
									params={{ groupId: group.id }}
									className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
										on ? "bg-accent" : "hover:bg-secondary"
									}`}
								>
									<Monogram
										label={group.name.charAt(0)}
										color={groupColorFor(group.id)}
										className="size-[42px]"
									/>
									<div className="min-w-0 flex-1">
										<div className="truncate font-heading text-[14.5px] font-bold text-foreground">
											{group.name}
										</div>
										<div className="mt-0.5 text-[11.5px] text-muted-foreground">
											{memberCount != null ? `${memberCount}人` : "…"}
										</div>
									</div>
								</Link>
							);
						})}
					</Panel>

					<Outlet />
				</div>
			)}
		</div>
	);
}
