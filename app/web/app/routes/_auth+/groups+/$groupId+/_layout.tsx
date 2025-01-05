import type { MetaFunction } from "react-router";
import { Await, NavLink, Outlet, useLoaderData, useMatches } from "react-router";
import { Suspense } from "react";

import type { GroupLoader } from "~/features/groups/loaders";
import { cn } from "~/lib/utils";

export { groupLoader as loader } from "~/features/groups/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | グループ詳細" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupDetail() {
	const macthes = useMatches();
	const { params } = macthes[0];
	const groupId = params.groupId;

	const { group } = useLoaderData<GroupLoader>();

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<Suspense
					fallback={<div className="animate-pulse bg-slate-200 h-12 w-full" />}
				>
					<Await resolve={group}>
						{(group) => <h1 className="text-std-32N-150">{group.name}</h1>}
					</Await>
				</Suspense>
			</div>
			<div className="flex flex-row gap-5">
				<NavLink
					className={({ isActive }) =>
						cn("text-std-18B-160", !isActive && "opacity-40")
					}
					to={`/groups/${groupId}/events`}
				>
					イベント
				</NavLink>
				<NavLink
					className={({ isActive }) =>
						cn("text-std-18B-160", !isActive && "opacity-40")
					}
					to={`/groups/${groupId}/members`}
				>
					メンバー
				</NavLink>
				<NavLink
					className={({ isActive }) =>
						cn("text-std-18B-160", !isActive && "opacity-40")
					}
					to={`/groups/${groupId}/settings`}
				>
					設定
				</NavLink>
			</div>
			<Outlet />
		</div>
	);
}
