import { Await, useLoaderData } from "@remix-run/react";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

import type { EventListLoader } from "../loaders";
import { EventCard } from "./event-card";

export function EventList() {
	const { events } = useLoaderData<EventListLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
				<Await resolve={events}>
					{({ events }) =>
						Array.isArray(events) && events.length > 0 ? (
							<div className="flex flex-col gap-1 py-5">
								{events.map((event) => (
									<Fragment key={event.eventId}>
										<EventCard event={event} />
										<Divider />
									</Fragment>
								))}
							</div>
						) : (
							<div className="w-full">
								<h2 className="mt-20 text-std-24N-150 text-center">
									イベントが存在しません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
