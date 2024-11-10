import type { MetaFunction } from "@remix-run/cloudflare";
import { useActionData } from "@remix-run/react";
import { useEffect } from "react";

import { useToast } from "~/components/ui/use-toast";

import type { CreateFriendAction } from "~/features/friends/actions";
import { FriendRequestList } from "~/features/friends/components/friend-request-list";
import { SearchUserForm } from "~/features/users/components";
export { createFriendAction as action } from "~/features/friends/actions";
export { friendRequestLoader as loader } from "~/features/friends/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | フレンド申請" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function FriendRequest() {
	const { toast } = useToast();

	const actionData = useActionData<CreateFriendAction>();
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
				<h1 className="text-std-32N-150">フレンド申請</h1>
			</div>
			<SearchUserForm />
			<FriendRequestList />
		</div>
	);
}
