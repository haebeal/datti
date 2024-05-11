import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { GroupEventsLoader } from "~/.server/loaders";
import { EventList } from "~/components/EventList";
import { Button } from "~/components/ui/button";

export { groupEventsLoader as loader } from "~/.server/loaders";

export default function GroupEvents() {
  const { pathname } = useLocation();
  const { state } = useNavigation();
  const { events } = useLoaderData<GroupEventsLoader>();

  return (
    <div className="flex flex-col py-3 gap-3">
      <div className="flex flex-row-reverse items-center justify-items-end">
        <Link
          className="flex items-center"
          to={{
            pathname: `${pathname}/create`,
          }}
        >
          <Button
            disabled={state === "loading"}
            className="bg-sky-500 hover:bg-sky-600 font-semibold"
          >
            イベント作成
          </Button>
        </Link>
      </div>
      <EventList events={events} />
      <Outlet />
    </div>
  );
}
