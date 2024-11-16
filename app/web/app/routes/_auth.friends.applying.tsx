import type { MetaFunction } from "@remix-run/cloudflare";
import { useActionData } from "@remix-run/react";
import { useEffect } from "react";

import { useToast } from "~/components/ui/use-toast";

import type { ApplyFriendAction } from "~/features/friends/actions";
import { ApplyingList } from "~/features/friends/components";
export { applyFriendAction as action } from "~/features/friends/actions";
export { applyingListLoader as loader } from "~/features/friends/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 承認待ち一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Applying() {
	const { toast } = useToast();

	const actionData = useActionData<ApplyFriendAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-3">
			<ApplyingList />
		</div>
	);
}
