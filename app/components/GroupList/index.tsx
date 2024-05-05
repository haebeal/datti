import { useNavigation } from "@remix-run/react";
import { Group } from "~/api/datti/@types";
import { GroupCard } from "~/components/GroupCard";

interface Props {
  groups: Group[];
}

export function GroupList({ groups }: Props) {
  const { state } = useNavigation();

  if (state === "loading") {
    return (
      <div className="w-full min-h-[60vh] grid place-content-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (Array.isArray(groups) && groups.length > 0) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center p-4">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <h2 className="font-semibold text-2xl text-center">
        グループに参加してません😿
      </h2>
    </div>
  );
}
