import type { MetaFunction } from "@remix-run/cloudflare";
import { Outlet, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GroupAction } from "~/.server/actions";
import { GroupForm } from "~/components/GroupForm";
import { GroupList } from "~/components/GroupList";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";

export { groupAction as action } from "~/.server/actions";
export { groupsLoader as loader } from "~/.server/loaders";

export const meta: MetaFunction = () => [
  { title: "Datti | グループ一覧" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
  const { state } = useNavigation();
  const [isOpen, setOpen] = useState(false);
  const { toast } = useToast();

  const actionData = useActionData<GroupAction>();
  useEffect(() => {
    if (actionData) {
      setOpen(false);
      toast({
        title: actionData.message,
      });
    }
  }, [actionData, toast]);

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">グループ一覧</h1>
        <Dialog open={isOpen} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={state === "loading"}
              className="bg-sky-500 hover:bg-sky-600 font-semibold"
            >
              グループ作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>グループ作成</DialogTitle>
            </DialogHeader>
            <GroupForm method="post" />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <GroupList />
      </div>
      <Outlet />
    </div>
  );
}
