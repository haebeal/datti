import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import type { EventsLoader } from "~/.server/loaders";
import { EventCard } from "~/components/EventCard";

function LoadingSpinner() {
	return (
		<div className="w-full min-h-[60vh] grid place-content-center">
			<div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
		</div>
	);
}

export function EventList() {
	const { events } = useLoaderData<EventsLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<LoadingSpinner />}>
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
