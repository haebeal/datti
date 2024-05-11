import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { GroupLoader } from "~/.server/loaders";
import { MemberCard } from "~/components/MemberCard";

function LoadingSpinner() {
  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export function MemberList() {
  const { group } = useLoaderData<GroupLoader>();

  return (
    <div className="w-full min-h-[60vh]">
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={group}>
          {({ users }) =>
            Array.isArray(users) && users.length > 0 ? (
              <div className="w-full flex flex-col items-center p-4 gap-3">
                {users.map((user) => (
                  <MemberCard key={user.uid} user={user} />
                ))}
              </div>
            ) : (
              <div className="w-full min-h-[60vh] grid place-content-center">
                <h2 className="font-semibold text-2xl text-center">
                  グループメンバーはいません😿
                </h2>
              </div>
            )
          }
        </Await>
      </Suspense>
    </div>
  );
}
