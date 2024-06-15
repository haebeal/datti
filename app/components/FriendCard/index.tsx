import { Form, useLocation, useNavigation } from "@remix-run/react";
import { User } from "~/api/datti/@types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

interface Props {
  friend: User;
}

export function FriendCard({ friend }: Props) {
  const { search } = useLocation();
  const { state } = useNavigation();
  const searchParams = new URLSearchParams(search);

  const status = searchParams.get("status");

  return (
    <div className="flex flex-row  w-full bg-white px-6 py-5 gap-5 items-center rounded-md border border-gray-200">
      <Avatar className="border h-14 w-14 border-gray-200">
        <AvatarImage src={friend.photoUrl} />
        <AvatarFallback>{friend.name} photo</AvatarFallback>
      </Avatar>
      <h1 className="text-lg font-bold mr-auto">{friend.name}</h1>

      {status === "pending" ? (
        <Form method="delete">
          <input type="hidden" name="uid" value={friend.uid} />
          <Button
            disabled={state === "submitting"}
            className="font-semibold bg-red-500 hover:bg-red-600"
            type="submit"
          >
            取り消し
          </Button>
        </Form>
      ) : status === "applying" ? (
        <>
          <Form method="post">
            <input type="hidden" name="uid" value={friend.uid} />
            <Button
              disabled={state === "submitting"}
              className="font-semibold bg-sky-500 hover:bg-sky-600"
              type="submit"
            >
              承認
            </Button>
          </Form>
          <Form method="delete">
            <input type="hidden" name="uid" value={friend.uid} />
            <Button
              disabled={state === "submitting"}
              className="font-semibold bg-red-500 hover:bg-red-600"
              type="submit"
            >
              却下
            </Button>
          </Form>
        </>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={state === "submitting"}
              className="bg-red-500 hover:bg-red-600 font-semibold"
            >
              解除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              {friend.name}をフレンドから解除しますか?
            </AlertDialogHeader>
            <AlertDialogDescription>
              フレンドを解除すると相手からもフレンドではなくなります。
              <br />
              本当によろしいですか？
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <Form method="delete">
                <input type="hidden" name="uid" value={friend.uid} />
                <AlertDialogAction
                  disabled={state === "submitting"}
                  className="font-semibold bg-red-500 hover:bg-red-600"
                  type="submit"
                >
                  解除
                </AlertDialogAction>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
