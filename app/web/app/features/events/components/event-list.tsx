import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

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
							<div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
								{events.map((event) => (
									<EventCard key={event.eventId} event={event} />
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-semibold text-2xl text-center">
									イベントが存在しません😿
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
