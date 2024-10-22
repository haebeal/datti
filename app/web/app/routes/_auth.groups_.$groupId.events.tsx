import type { MetaFunction } from "@remix-run/cloudflare";
import {
	Await,
	Outlet,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";

import type { CreateEventAction } from "~/features/events/actions";
import { CreateEventForm, EventList } from "~/features/events/components";
import type { EventListLoader } from "~/features/events/loaders";
export { createEventAction as action } from "~/features/events/actions";
export { eventListLoader as loader } from "~/features/events/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | イベント一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupEvents() {
	const { state } = useNavigation();
	const [isOpen, setOpen] = useState(false);
	const { toast } = useToast();

	const { members } = useLoaderData<EventListLoader>();
	const actionData = useActionData<CreateEventAction>();
	useEffect(() => {
		if (actionData) {
			setOpen(false);
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-3">
			<div className="flex flex-row-reverse items-center justify-items-end">
				<Dialog open={isOpen} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button
							disabled={state === "loading"}
							className="bg-sky-500 hover:bg-sky-600 font-semibold"
						>
							イベント作成
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>イベント作成</DialogTitle>
						</DialogHeader>
						<Suspense fallback={<p>loading...</p>}>
							<Await resolve={members}>
								{({ members }) => <CreateEventForm members={members} />}
							</Await>
						</Suspense>
					</DialogContent>
				</Dialog>
			</div>
			<EventList />
			<Outlet />
		</div>
	);
}
