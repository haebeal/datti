import { Link } from "@remix-run/react";
import type { Group } from "~/api/@types";

interface Props {
	group: Group;
}

export function GroupCard({ group }: Props) {
	return (
		<Link
			to={`/groups/${group.groupId}`}
			className="flex flex-row  w-full bg-white hover:bg-slate-50 hover:cursor-pointer px-6 py-5 gap-5 items-center rounded-md border border-gray-200"
		>
			<h1 className="text-lg font-bold mr-auto">{group.name}</h1>
		</Link>
	);
}
