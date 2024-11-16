import type { MetaFunction } from "@remix-run/cloudflare";
import {
	Await,
	useActionData,
	useLoaderData,
	useLocation,
	useNavigate,
} from "@remix-run/react";
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
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const { members } = useLoaderData<createEventLoader>();
	const actionData = useActionData<UpdateEventAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
			navigate(pathname.slice(0, -7));
		}
	}, [actionData, pathname, toast, navigate]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
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
