import { useNavigation } from "@remix-run/react";
import { Event } from "~/api/datti/@types";
import { EventCard } from "~/components/EventCard";

interface Props {
  events: Event[];
}

export function EventList({ events }: Props) {
  const { state } = useNavigation();

  if (state === "loading") {
    return (
      <div className="w-full min-h-[60vh] grid place-content-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (Array.isArray(events) && events.length > 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <h2 className="font-semibold text-2xl text-center">
        イベントが存在しません😿
      </h2>
    </div>
  );
}
