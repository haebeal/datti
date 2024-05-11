import {
  Outlet,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { GroupAction } from "~/.server/actions";
import { GroupEventsLoader } from "~/.server/loaders";
import { EventForm } from "~/components/EventForm";
import { EventList } from "~/components/EventList";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export { groupEventsAction as action } from "~/.server/actions";
export { groupEventsLoader as loader } from "~/.server/loaders";

export default function GroupEvents() {
  const { state } = useNavigation();
  const { events } = useLoaderData<GroupEventsLoader>();
  const lastResult = useActionData<GroupAction>();

  const [isOpen, setOpen] = useState(false);
  useEffect(() => {
    if (lastResult?.status === "success") {
      setOpen(false);
    }
  }, [lastResult]);

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
              <DialogTitle>フレンド申請</DialogTitle>
            </DialogHeader>
            <EventForm lastResult={lastResult} method="post" />
          </DialogContent>
        </Dialog>
      </div>
      <EventList events={events} />
      <Outlet />
    </div>
  );
}
