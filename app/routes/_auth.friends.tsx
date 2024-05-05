import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { FriendsLoader } from "~/.server/loaders/friendsLoader";
import { FriendList } from "~/components/FriendList";
import { Button } from "~/components/ui/button";

export { friendsAction as action } from "~/.server/actions";
export { friendsRequestsLoader as loader } from "~/.server/loaders";

export default function Friend() {
  const { friends } = useLoaderData<FriendsLoader>();
  const { state } = useNavigation();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

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
        <div className="flex flex-row border-b-2 text-lg font-semibold gap-5 py-1 px-4">
          <NavLink
            className={({ isActive }) =>
              isActive && searchParams.get("status") === null
                ? undefined
                : "opacity-40"
            }
            to={{
              pathname: "/friends",
            }}
          >
            フレンド
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive && searchParams.get("status") === "requests"
                ? undefined
                : "opacity-40"
            }
            to={{
              pathname: "/friends",
              search: "?status=requests",
            }}
          >
            申請中
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive && searchParams.get("status") === "pendings"
                ? undefined
                : "opacity-40"
            }
            to={{
              pathname: "/friends",
              search: "?status=pendings",
            }}
          >
            受理中
          </NavLink>
        </div>
        <FriendList friends={friends} />
      </div>
      <Outlet />
    </div>
  );
}
