import { Form, useNavigation } from "@remix-run/react";
import { User } from "~/api/datti/@types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

interface Props {
  user: User;
}

export function UserCard({ user }: Props) {
  const { state } = useNavigation();

  return (
    <div className="flex flex-row w-full bg-white px-4 py-3 gap-5 items-center rounded-md border border-gray-200">
      <Avatar className="border h-10 w-10 border-gray-200">
        <AvatarImage src={user.photoUrl} />
        <AvatarFallback>{user.name} photo</AvatarFallback>
      </Avatar>
      <h1 className="text-lg font-bold mr-auto">{user.name}</h1>
      <Form method="post">
        <input type="hidden" name="uid" value={user.uid} />
        <Button
          disabled={state === "submitting" || state === "loading"}
          type="submit"
          className="bg-sky-500 hover:bg-sky-600 font-semibold"
        >
          申請
        </Button>
      </Form>
    </div>
  );
}
