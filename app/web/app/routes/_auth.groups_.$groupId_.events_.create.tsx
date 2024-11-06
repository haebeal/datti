import type { MetaFunction } from "@remix-run/cloudflare";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";

import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { UpdateEventAction } from "~/features/events/actions";
import { CreateEventForm } from "~/features/events/components";
import type { createEventLoader } from "~/features/events/loaders";
export { createEventAction as action } from "~/features/events/actions";
export { createEventLoader as loader } from "~/features/events/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | イベント作成" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function EventDetail() {
	const { toast } = useToast();

	const { members } = useLoaderData<createEventLoader>();
	const actionData = useActionData<UpdateEventAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-row items-center justify-between py-5 px-3">
				<h1 className="text-std-32N-150">イベント作成</h1>
			</div>
			<Suspense fallback={<Spinner />}>
				<Await resolve={members}>
					{({ members }) => <CreateEventForm members={members} />}
				</Await>
			</Suspense>
		</div>
	);
}