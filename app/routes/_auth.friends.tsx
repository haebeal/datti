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
    <div className="grid gap-5">
      <h1 className="font-bold text-2xl py-2">フレンド一覧</h1>
      <div className="flex items-center">
        <Button
          disabled={state === "loading"}
          className="ml-auto bg-blue-500 hover:bg-blue-600 font-semibold"
        >
          <Link to="/friends/requests">フレンド申請</Link>
        </Button>
      </div>
      <div className="w-full">
        <FriendList friends={friends} />
      </div>
      <Outlet />
    </div>
  );
}
