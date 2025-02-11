import { HTTPError } from "@aspida/fetch";
import { Suspense } from "react";
import type { MetaFunction } from "react-router";
import {
	Await,
	NavLink,
	Outlet,
	useLoaderData,
	useMatches,
} from "react-router";

import { cn } from "~/lib/utils";
import type { Route } from "./+types/_layout.tsx";

import type { GroupLoader } from "~/features/groups/loaders";

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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (error instanceof HTTPError && error.response.status === 404) {
		return (
			<div className="flex flex-col gap-3 pt-32">
				<h1 className="text-std-45B-140 text-center">404</h1>
				<h3 className="text-std-22N-150 text-center">
					グループ情報の取得に失敗しました
				</h3>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 pt-32">
			<h1 className="text-std-45B-140 text-center">500</h1>
			<h3 className="text-std-22N-150 text-center">
				不明なエラーが発生しました
			</h3>
		</div>
	);
}
