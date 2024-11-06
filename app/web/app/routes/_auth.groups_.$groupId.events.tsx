import type { MetaFunction } from "@remix-run/cloudflare";
import {
	Await,
	Outlet,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useRef, useState } from "react";

import { Button, Dialog, DialogBody } from "~/components";
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

	const dialogRef = useRef<HTMLDialogElement>(null);

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
			<div className="flex flex-row-reverse">
				<Button
					size="md"
					onClick={() => dialogRef.current?.showModal()}
					variant="solid-fill"
				>
					イベント作成
				</Button>
			</div>
			<div className="flex flex-row-reverse items-center justify-items-end">
				<Dialog
					aria-labelledby="create-event-dialog"
					className="w-full max-w-[calc(560/16*1rem)]"
					ref={dialogRef}
				>
					<DialogBody>
						<h2 className="text-std-24N-150">イベント作成</h2>
						<Suspense fallback={<p>loading...</p>}>
							<Await resolve={members}>
								{({ members }) => <CreateEventForm members={members} />}
							</Await>
						</Suspense>
					</DialogBody>
				</Dialog>
			</div>
			<EventList />
			<Outlet />
		</div>
	);
}
