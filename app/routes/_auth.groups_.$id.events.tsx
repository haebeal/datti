import { useLoaderData } from "@remix-run/react";
import { GroupEventsLoader } from "~/.server/loaders";
import { EventList } from "~/components/EventList";

export { groupEventsLoader as loader } from "~/.server/loaders";

export default function GroupEvents() {
  const { events } = useLoaderData<GroupEventsLoader>();

  return <EventList events={events} />;
}
