import type { MetaFunction } from "@remix-run/cloudflare";
import {
	NavLink,
	useActionData,
	useNavigate,
	useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";

import { Button } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import { cn } from "~/lib/utils";

import type { DeleteFriendAction } from "~/features/friends/actions";
import { FriendList } from "~/features/friends/components";
export { deleteFriendAction as action } from "~/features/friends/actions";
export { friendListLoader as loader } from "~/features/friends/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | フレンド一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Friend() {
	const [searchParams] = useSearchParams();
	const status = searchParams.get("status")?.toString();

	const { toast } = useToast();
	const navigate = useNavigate();

	const actionData = useActionData<DeleteFriendAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">フレンド</h1>
				<Button
					size="md"
					onClick={() => navigate("/friends/request")}
					variant="solid-fill"
				>
					フレンド申請
				</Button>
			</div>
			<div className="flex flex-row gap-5">
				<NavLink
					className={({ isActive }) =>
						cn(
							"text-std-18B-160",
							isActive &&
								(status === "requesting" || status === "applying") &&
								"opacity-40",
						)
					}
					to={{
						pathname: "/friends",
					}}
				>
					フレンド
				</NavLink>
				<NavLink
					className={({ isActive }) =>
						cn(
							"text-std-18B-160",
							isActive && status !== "requesting" && "opacity-40",
						)
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
						cn(
							"text-std-18B-160",
							isActive && status !== "applying" && "opacity-40",
						)
					}
					to={{
						pathname: "/friends",
						search: "?status=applying",
					}}
				>
					承認待ち
				</NavLink>
			</div>
			<FriendList />
		</div>
	);
}
