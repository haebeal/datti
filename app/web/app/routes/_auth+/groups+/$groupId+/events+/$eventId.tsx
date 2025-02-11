import { Suspense, useEffect } from "react";
import type { MetaFunction } from "react-router";
import {
	Await,
	useActionData,
	useLoaderData,
	useLocation,
	useNavigate,
} from "react-router";
import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { UpdateEventAction } from "~/features/events/actions";
import { UpdateEventForm } from "~/features/events/components";
import type { EventLoader } from "~/features/events/loaders";
export { updateEventAction as action } from "~/features/events/actions";
export { eventLoader as loader } from "~/features/events/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | イベント編集" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function EventDetail() {
	const { toast } = useToast();
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const { event, members } = useLoaderData<EventLoader>();
	const actionData = useActionData<UpdateEventAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
			if (actionData.message === "イベントを削除しました") {
				navigate(pathname.slice(0, -37));
			}
		}
	}, [actionData, toast, pathname, navigate]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">イベント編集</h1>
			</div>
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
	);
}
