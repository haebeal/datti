import { MetaFunction } from "@remix-run/cloudflare";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { GroupEventsAction } from "~/.server/actions";
import { GroupEventLoader } from "~/.server/loaders";
import { EventForm } from "~/components/EventForm";
import { useToast } from "~/components/ui/use-toast";
import { eventUpdateFormSchema } from "~/schema/eventFormSchema";

export { groupEventsAction as action } from "~/.server/actions";
export { groupEventLoader as loader } from "~/.server/loaders";

export const meta: MetaFunction = () => [
  { title: "Datti | イベント編集" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

function LoadingSpinner() {
  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export default function EventDetail() {
  const { toast } = useToast();

  const { event } = useLoaderData<GroupEventLoader>();
  const actionData = useActionData<GroupEventsAction>();
  useEffect(() => {
    if (actionData) {
      toast({
        title: actionData.message,
      });
    }
  }, [actionData, toast]);

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">イベント編集</h1>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <div className="flex flex-col py-3 gap-7">
          <Suspense fallback={<LoadingSpinner />}>
            <Await resolve={event}>
              {(event) => (
                <EventForm
                  defaultValue={eventUpdateFormSchema.parse(event)}
                  method="put"
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
