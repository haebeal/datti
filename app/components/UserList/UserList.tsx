import { User } from "~/api/datti/@types";
import { UserCard } from "~/components/UserCard";

interface Props {
  users: User[];
}

export function UserList({ users }: Props) {
  return (
    <div className="flex flex-col rounded-lg items-center gap-3">
      {users.map((user) => (
        <UserCard key={user.uid} user={user} />
      ))}
    </div>
  );
}
