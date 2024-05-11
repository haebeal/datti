import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import { Form, Link, useNavigation } from "@remix-run/react";
import { Event } from "~/api/datti/@types";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface Props {
  event: Event;
}

export function EventCard({ event }: Props) {
  const { state } = useNavigation();

  return (
    <Link
      to={`/groups/${event.group_id}/events/${event.id}`}
      className="flex flex-row  w-full bg-white hover:bg-slate-50 hover:cursor-pointer px-6 py-5 gap-5 items-center rounded-md border border-gray-200"
    >
      <h1 className="text-lg font-bold mr-auto">{event.name}</h1>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={state === "submitting"}
            className="bg-red-500 hover:bg-red-600 font-semibold"
          >
            削除
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>イベントを削除しますか?</AlertDialogHeader>
          <AlertDialogDescription>
            イベントを削除すると他のユーザーからも削除されます。
            <br />
            本当によろしいですか？
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <Form method="delete">
              <input type="hidden" name="uid" value={event.id} />
              <AlertDialogAction
                disabled={state === "submitting"}
                className="font-semibold bg-red-500 hover:bg-red-600"
                type="submit"
              >
                削除
              </AlertDialogAction>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Link>
  );
}
