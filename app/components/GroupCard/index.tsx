import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import { Form, Link, useNavigation } from "@remix-run/react";
import { Group } from "~/api/datti/@types";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface Props {
  group: Group;
}

export function GroupCard({ group }: Props) {
  const { state } = useNavigation();

  return (
    <Link
      to={`/groups/${group.id}`}
      className="flex flex-row  w-full bg-white hover:bg-slate-50 hover:cursor-pointer px-6 py-5 gap-5 items-center rounded-md border border-gray-200"
    >
      <h1 className="text-lg font-bold mr-auto">{group.name}</h1>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            // disabled={state === "submitting"}
            disabled
            className="bg-red-500 hover:bg-red-600 font-semibold"
          >
            削除
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <span className="font-bold inline-block">{group.name}</span>
            を削除しますか?
          </AlertDialogHeader>
          <AlertDialogDescription>
            グループを削除してもイベントは削除されません。
            <br />
            本当によろしいですか？
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <Form method="delete">
              <input type="hidden" name="uid" value={group.id} />
              <AlertDialogAction type="submit">解除</AlertDialogAction>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Link>
  );
}
