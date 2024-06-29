import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { FriendsLoader } from "~/.server/loaders";
import { FriendRequestCard } from "~/components/FriendRequestCard";

function LoadingSpinner() {
  return (
    <div className="w-full h-full grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export function FriendRequestList() {
  const { users } = useLoaderData<FriendsLoader>();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Await resolve={users}>
        {({ users }) =>
          Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <FriendRequestCard key={user.userId} user={user} />
            ))
          ) : (
            <div className="w-full h-full grid place-content-center">
              <h3 className="font-semibold">ユーザーが見つかりませんでした</h3>
            </div>
          )
        }
      </Await>
    </Suspense>
  );
}
