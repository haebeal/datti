import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/utils/cn";
import { groupsQueryOptions } from "../queries";

const AVATAR_COLORS = [
	"bg-primary-base",
	"bg-accent-base",
	"bg-gray-400",
	"bg-success-base",
	"bg-error-base",
];

export function GroupSelector() {
	const { data: groups } = useQuery(groupsQueryOptions);
	const { pathname } = useLocation();

	if (!groups || groups.length === 0) {
		return (
			<p className="text-sm text-gray-500 px-4 py-2">グループがありません</p>
		);
	}

	return (
		<div className="flex flex-col gap-1">
			{groups.map((group, index) => {
				const isActive = pathname.includes(`/groups/${group.id}`);
				const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
				return (
					<Link
						key={group.id}
						to="/groups/$groupId/lendings"
						params={{ groupId: group.id }}
						className={cn(
							"flex items-center gap-3",
							"px-4 py-2 rounded-lg",
							"transition-colors",
							isActive
								? "bg-primary-surface text-primary-base font-semibold"
								: "text-gray-500 hover:bg-gray-50",
						)}
					>
						<div
							className={cn(
								"flex-shrink-0 w-7 h-7 rounded-full",
								colorClass,
								"flex items-center justify-center text-white font-bold text-xs",
							)}
						>
							{group.name.charAt(0)}
						</div>
						<span className="text-sm truncate">{group.name}</span>
					</Link>
				);
			})}
		</div>
	);
}
