import type { MetaFunction } from "@remix-run/cloudflare";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { UpdateEventAction } from "~/features/events/actions";
import { UpdateEventForm } from "~/features/events/components";
import type { EventLoader } from "~/features/events/loaders";
export { createEventAction as action } from "~/features/events/actions";
export { eventLoader as loader } from "~/features/events/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | イベント編集" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function EventDetail() {
	const { toast } = useToast();

	const { event, members } = useLoaderData<EventLoader>();
	const actionData = useActionData<UpdateEventAction>();
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
				<h1 className="font-bold text-2xl">イベント編集</h1>
			</div>
			<div className="rounded-lg bg-white py-3 px-5">
				<div className="flex flex-col py-3 gap-7">
					<Suspense fallback={<Spinner />}>
						<Await resolve={event}>
							{(event) => (
								<Await resolve={members}>
									{({ members }) => (
										<UpdateEventForm defaultValue={event} members={members} />
									)}
								</Await>
							)}
						</Await>
					</Suspense>
				</div>
			</div>
		</div>
	);
}
