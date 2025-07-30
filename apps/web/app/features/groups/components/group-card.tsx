import { Link } from "react-router";
import type { Group } from "~/api/@types";

interface Props {
	group: Group;
}

export function GroupCard({ group }: Props) {
	return (
		<Link
			to={`/groups/${group.groupId}`}
			className="flex flex-row gap-5 items-center justify-between py-5 px-3"
		>
			<span className="text-std-20N-150 pl-3">{group.name}</span>
			<svg
				role="img"
				aria-label={`${group.name}を開く`}
				xmlns="http://www.w3.org/2000/svg"
				height="45px"
				width="45px"
				viewBox="0 -960 960 960"
				fill="#000000"
			>
				<path d="M540-480 356-664l20-20 204 204-204 204-20-20 184-184Z" />
			</svg>
		</Link>
	);
}
