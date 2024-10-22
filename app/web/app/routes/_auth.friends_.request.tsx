import { useActionData } from "@remix-run/react";
import { useEffect } from "react";

import { useToast } from "~/components/ui/use-toast";

import type { CreateFriendAction } from "~/features/friends/actions";
import { FriendRequestList } from "~/features/friends/components/friend-request-list";
export { createFriendAction as action } from "~/features/friends/actions";
export { friendRequestLoader as loader } from "~/features/friends/loaders";

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
		<div className="flex flex-col py-3 gap-7">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">フレンド申請</h1>
			</div>
			<div className="rounded-lg bg-white py-3 px-5">
				<FriendRequestList />
			</div>
		</div>
	);
}
