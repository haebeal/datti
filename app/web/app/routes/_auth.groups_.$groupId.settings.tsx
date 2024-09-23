import type { MetaFunction } from "@remix-run/cloudflare";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";

import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { UpdateGroupAction } from "~/features/groups/actions";
import { UpdateGroupForm } from "~/features/groups/components";
import type { GroupLoader } from "~/features/groups/loaders";
export { updateGroupAction as action } from "~/features/groups/actions";
export { groupLoader as loader } from "~/features/groups/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | グループ編集" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupSettings() {
	const { toast } = useToast();

	const { group } = useLoaderData<GroupLoader>();
	const actionData = useActionData<UpdateGroupAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="py-4">
			<Suspense fallback={<Spinner />}>
				<Await resolve={group}>
					{(group) => <UpdateGroupForm defaultValue={group} />}
				</Await>
			</Suspense>
		</div>
	);
}
