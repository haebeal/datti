import type { MetaFunction } from "react-router";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components";

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
