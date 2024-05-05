import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { FriendsLoader } from "~/.server/loaders/friendsLoader";
import { FriendList } from "~/components/FriendList";
import { Button } from "~/components/ui/button";

export { friendsAction as action } from "~/.server/actions";
export { friendsRequestsLoader as loader } from "~/.server/loaders";

export default function Friend() {
  const { friends } = useLoaderData<FriendsLoader>();
  const { state } = useNavigation();

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">フレンド一覧</h1>
        <Link className="flex items-center" to="/friends/requests">
          <Button
            disabled={state === "loading"}
            className="ml-auto bg-sky-500 hover:bg-sky-600 font-semibold"
          >
            フレンド申請
          </Button>
        </Link>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <FriendList friends={friends} />
      </div>
      <Outlet />
    </div>
  );
}
