import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { GroupAction } from "~/.server/actions";
import { GroupLoader } from "~/.server/loaders";
import { GroupForm } from "~/components/GroupForm";

export { groupAction as action } from "~/.server/actions";
export { groupLoader as loader } from "~/.server/loaders";

function LoadingSpinner() {
  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export default function GroupSettings() {
  const { group } = useLoaderData<GroupLoader>();
  const lastResult = useActionData<GroupAction>();

  return (
    <div className="py-4">
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={group}>
          {(group) => (
            <GroupForm
              defaultValue={group}
              lastResult={lastResult}
              buttonLabel="更新"
            />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
