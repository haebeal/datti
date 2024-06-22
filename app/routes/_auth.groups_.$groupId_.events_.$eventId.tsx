import { MetaFunction } from "@remix-run/cloudflare";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { EventAction } from "~/.server/actions";
import { EventLoader } from "~/.server/loaders";
import { EventUpdateForm } from "~/components/EventUpdateForm";
import { useToast } from "~/components/ui/use-toast";

export { eventAction as action } from "~/.server/actions";
export { eventLoader as loader } from "~/.server/loaders";

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

  const { event } = useLoaderData<EventLoader>();
  const actionData = useActionData<EventAction>();
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
              {(event) => <EventUpdateForm defaultValue={event} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
