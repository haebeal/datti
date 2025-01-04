import type { MetaFunction } from "@remix-run/cloudflare";
import { useActionData } from "@remix-run/react";
import { useEffect } from "react";

import { useToast } from "~/components/ui/use-toast";

import type { DeleteFriendAction } from "~/features/friends/actions";
import { RequestingList } from "~/features/friends/components";
export { deleteFriendAction as action } from "~/features/friends/actions";
export { requestingListLoader as loader } from "~/features/friends/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 申請中一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Requesting() {
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
		<div className="flex flex-col py-3 gap-3">
			<RequestingList />
		</div>
	);
}
