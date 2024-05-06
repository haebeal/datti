import { useNavigation } from "@remix-run/react";
import { User } from "~/api/datti/@types";
import { FriendRequestCard } from "~/components/FriendRequestCard";

interface Props {
  users: User[];
}

export function FriendRequestList({ users }: Props) {
  const { state } = useNavigation();

  if (state === "loading") {
    return (
      <div className="w-full h-full grid place-content-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (users.length < 0) {
    return (
      <div className="w-full h-full grid place-content-center">
        <h3 className="font-semibold">ユーザーが見つかりませんでした</h3>
      </div>
    );
  }

  return (
    <>
      {users.map((user) => (
        <FriendRequestCard key={user.uid} user={user} />
      ))}
    </>
  );
}
