import { useNavigation } from "@remix-run/react";
import { User } from "~/api/datti/@types";
import { FriendCard } from "~/components/FriendCard";

interface Props {
  friends: User[];
}

export function FriendList({ friends }: Props) {
  const { state } = useNavigation();

  if (state === "loading") {
    return (
      <div className="w-full min-h-[60vh] grid place-content-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (Array.isArray(friends) && friends.length > 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center p-4">
        {friends.map((friend) => (
          <FriendCard key={friend.uid} friend={friend} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <h2 className="font-semibold text-2xl text-center">
        フレンドがいません😿
      </h2>
    </div>
  );
}
