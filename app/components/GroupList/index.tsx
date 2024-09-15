import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import type { GroupsLoader } from "~/.server/loaders";
import { GroupCard } from "~/components/GroupCard";

function LoadingSpinner() {
	return (
		<div className="w-full min-h-[60vh] grid place-content-center">
			<div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
		</div>
	);
}

export function GroupList() {
	const { groups } = useLoaderData<GroupsLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<LoadingSpinner />}>
				<Await resolve={groups}>
					{({ groups }) =>
						Array.isArray(groups) && groups.length > 0 ? (
							<div className="w-full flex flex-col items-center p-4 gap-3">
								{groups.map((group) => (
									<GroupCard key={group.groupId} group={group} />
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-semibold text-2xl text-center">
									グループに参加してません😿
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
