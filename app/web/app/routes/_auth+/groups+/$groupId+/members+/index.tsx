import { HTTPError } from "@aspida/fetch";
import type { MetaFunction } from "react-router";

import type { Route } from "./+types/add";

import { MemberList } from "~/features/members/components";
export { memberListLoader as loader } from "~/features/members/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | メンバー一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupMembers() {
	return (
		<div className="flex flex-col py-3 gap-3">
			<MemberList />
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (error instanceof HTTPError && error.response.status === 404) {
		return (
			<div className="flex flex-col gap-3 pt-32">
				<h1 className="text-std-45B-140 text-center">404</h1>
				<h3 className="text-std-22N-150 text-center">
					グループメンバーの取得に失敗しました
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
