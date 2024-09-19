import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import type { GroupAction } from "~/.server/actions";
import type { GroupLoader } from "~/.server/loaders";
import { GroupForm } from "~/components/GroupForm";
import { useToast } from "~/components/ui/use-toast";

export { groupAction as action } from "~/.server/actions";
export { groupLoader as loader } from "~/.server/loaders";

function LoadingSpinner() {
	return (
		<div className="w-full min-h-[60vh] grid place-content-center">
			<div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
		</div>
	);
}

export default function GroupSettings() {
	const { toast } = useToast();

	const { group } = useLoaderData<GroupLoader>();
	const actionData = useActionData<GroupAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="py-4">
			<Suspense fallback={<LoadingSpinner />}>
				<Await resolve={group}>
					{(group) => <GroupForm defaultValue={group} method="put" />}
				</Await>
			</Suspense>
		</div>
	);
}
