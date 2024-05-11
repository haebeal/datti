import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { FriendList } from "~/components/FriendList";
import { Button } from "~/components/ui/button";

export { friendsLoader as loader } from "~/.server/loaders";

export default function Friend() {
  const { state } = useNavigation();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const status = searchParams.get("status");

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">フレンド一覧</h1>
        <Link
          className="flex items-center"
          to={{
            pathname: "/friends/requests",
            search: status ? `?status=${status}` : undefined,
          }}
        >
          <Button
            disabled={state !== "idle"}
            className="bg-sky-500 hover:bg-sky-600 font-semibold"
          >
            フレンド申請
          </Button>
        </Link>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <div className="flex flex-row border-b-2 text-lg font-semibold gap-5 py-1 px-4">
          <NavLink
            className={({ isActive }) =>
              isActive && status === null ? undefined : "opacity-40"
            }
            to={{
              pathname: "/friends",
            }}
          >
            フレンド
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive && status === "requests" ? undefined : "opacity-40"
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
              isActive && status === "pendings" ? undefined : "opacity-40"
            }
            to={{
              pathname: "/friends",
              search: "?status=pendings",
            }}
          >
            受理中
          </NavLink>
        </div>
        <FriendList />
      </div>
      <Outlet />
    </div>
  );
}
