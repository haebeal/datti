import { useNavigation } from "@remix-run/react";
import { User } from "~/api/datti/@types";
import { MemberCard } from "~/components/MemberCard";

interface Props {
  members: User[];
}

export function MemberList({ members }: Props) {
  const { state } = useNavigation();

  if (state === "loading") {
    return (
      <div className="w-full min-h-[60vh] grid place-content-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (Array.isArray(members) && members.length > 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
        {members.map((member) => (
          <MemberCard key={member.uid} user={member} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <h2 className="font-semibold text-2xl text-center">
        グループメンバーはいません😿
      </h2>
    </div>
  );
}
