import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { GroupMembersLoader } from "~/.server/loaders";
import { MemberCard } from "~/components/MemberCard";

function LoadingSpinner() {
  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export function MemberList() {
  const { members } = useLoaderData<GroupMembersLoader>();

  return (
    <div className="w-full min-h-[60vh]">
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={members}>
          {({ members }) =>
            Array.isArray(members) && members.length > 0 ? (
              <div className="w-full flex flex-col items-center p-4 gap-3">
                {members.map((member) => (
                  <MemberCard key={member.uid} user={member} />
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
