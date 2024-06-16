import {
  NavLink,
  useActionData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";
import { FriendsAction } from "~/.server/actions";
import { FriendList } from "~/components/FriendList";
import { FriendRequestForm } from "~/components/FriendRequestForm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";

export { friendsAction as action } from "~/.server/actions";
export { friendsLoader as loader } from "~/.server/loaders";

export default function Friend() {
  const { state } = useNavigation();

  const [searchParams] = useSearchParams();
  const status = searchParams.get("status")?.toString();

  const { toast } = useToast();

  const actionData = useActionData<FriendsAction>();
  useEffect(() => {
    if (actionData) {
      toast({
        title: actionData.message,
      });
    }
  }, [actionData]);

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">フレンド一覧</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={state !== "idle"}
              className="bg-sky-500 hover:bg-sky-600 font-semibold"
            >
              フレンド申請
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>フレンド申請</DialogTitle>
            </DialogHeader>
            <FriendRequestForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <div className="flex flex-row border-b-2 text-lg font-semibold gap-5 py-1 px-4">
          <NavLink
            className={({ isActive }) =>
              isActive && status !== "requesting" && status !== "applying"
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
              isActive && status === "requesting" ? undefined : "opacity-40"
            }
            to={{
              pathname: "/friends",
              search: "?status=requesting",
            }}
          >
            申請中
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive && status === "applying" ? undefined : "opacity-40"
            }
            to={{
              pathname: "/friends",
              search: "?status=applying",
            }}
          >
            受理中
          </NavLink>
        </div>
        <FriendList />
      </div>
    </div>
  );
}
