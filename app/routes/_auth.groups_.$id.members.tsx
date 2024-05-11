import { Outlet, useNavigation } from "@remix-run/react";
import { MemberAddForm } from "~/components/MemberAddForm";
import { MemberList } from "~/components/MemberList";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export { groupMembersAction as action } from "~/.server/actions";
export { groupLoader as loader } from "~/.server/loaders";

export default function GroupMembers() {
  const { state } = useNavigation();

  return (
    <div className="flex flex-col py-3 gap-3">
      <div className="flex flex-row-reverse items-center justify-items-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={state !== "idle"}
              className="bg-sky-500 hover:bg-sky-600 font-semibold"
            >
              メンバー追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>メンバー追加</DialogTitle>
            </DialogHeader>
            <MemberAddForm />
          </DialogContent>
        </Dialog>
      </div>
      <MemberList />
      <Outlet />
    </div>
  );
}
