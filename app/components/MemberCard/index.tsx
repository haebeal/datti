import { User } from "~/api/datti/@types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface Props {
  user: User;
}

export function MemberCard({ user }: Props) {
  return (
    <div className="flex flex-row  w-full bg-white px-6 py-5 gap-5 items-center rounded-md border border-gray-200">
      <Avatar className="border h-14 w-14 border-gray-200">
        <AvatarImage src={user.photoUrl} />
        <AvatarFallback>{user.name} photo</AvatarFallback>
      </Avatar>
      <h1 className="text-lg font-bold mr-auto">{user.name}</h1>
    </div>
  );
}
