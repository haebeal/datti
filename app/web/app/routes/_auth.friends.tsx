import {
	Link,
	NavLink,
	useActionData,
	useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";

import type { DeleteFriendAction } from "~/features/friends/actions";
import { FriendList } from "~/features/friends/components";
export { deleteFriendAction as action } from "~/features/friends/actions";
export { friendListLoader as loader } from "~/features/friends/loaders";

export default function Friend() {
	const [searchParams] = useSearchParams();
	const status = searchParams.get("status")?.toString();

	const { toast } = useToast();

	const actionData = useActionData<DeleteFriendAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-7">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">フレンド一覧</h1>
				<Button className="bg-sky-500 hover:bg-sky-600 font-semibold">
					<Link
						to="/friends/request"
						className="bg-sky-500 hover:bg-sky-600 font-semibold"
					>
						フレンド申請
					</Link>
				</Button>
			</div>
			<div className="rounded-lg bg-white py-3 px-5">
				<div className="flex flex-row border-b-2 text-lg font-semibold gap-5 py-1 px-4">
					<NavLink
						className={({ isActive }) =>
							isActive && status !== "requesting" && status !== "applying"
								? undefined
								: "opacity-40"
						}
						to={{
							pathname: "/friends",
						}}
					>
						フレンド
					</NavLink>
					<NavLink
						className={({ isActive }) =>
							isActive && status === "requesting" ? undefined : "opacity-40"
						}
						to={{
							pathname: "/friends",
							search: "?status=requesting",
						}}
					>
						申請中
					</NavLink>
					<NavLink
						className={({ isActive }) =>
							isActive && status === "applying" ? undefined : "opacity-40"
						}
						to={{
							pathname: "/friends",
							search: "?status=applying",
						}}
					>
						受理中
					</NavLink>
				</div>
				<FriendList />
			</div>
		</div>
	);
}
