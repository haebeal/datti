import { HTTPError } from "@aspida/fetch";
import type { MetaFunction } from "react-router";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components";

import type { Route } from "./+types/index";

import { EventList } from "~/features/events/components";
export { eventListLoader as loader } from "~/features/events/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | イベント一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupEvents() {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	return (
		<div className="flex flex-col py-3 gap-3">
			<div className="flex flex-row-reverse">
				<Button
					size="md"
					onClick={() => navigate(`${pathname}/create`)}
					variant="solid-fill"
				>
					イベント作成
				</Button>
			</div>
			<EventList />
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (error instanceof HTTPError && error.response.status === 404) {
		return (
			<div className="flex flex-col gap-3 pt-32">
				<h1 className="text-std-45B-140 text-center">404</h1>
				<h3 className="text-std-22N-150 text-center">
					イベントの取得に失敗しました
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
