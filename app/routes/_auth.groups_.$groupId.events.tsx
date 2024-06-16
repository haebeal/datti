import {
  Await,
  Outlet,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import { EventAction } from "~/.server/actions";
import { EventsLoader } from "~/.server/loaders";
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
import { useToast } from "~/components/ui/use-toast";

export { eventAction as action } from "~/.server/actions";
export { eventsLoader as loader } from "~/.server/loaders";

export default function GroupEvents() {
  const { state } = useNavigation();
  const [isOpen, setOpen] = useState(false);
  const { toast } = useToast();

  const { members } = useLoaderData<EventsLoader>();
  const actionData = useActionData<EventAction>();
  useEffect(() => {
    if (actionData) {
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
                {({ members }) => (
                  <EventForm
                    defaultValue={{
                      payments: members
                        .filter(({ status }) => status !== "me")
                        .map(({ uid }) => ({
                          paid_to: uid,
                          amount: 0,
                        })),
                    }}
                    method="post"
                  />
                )}
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
