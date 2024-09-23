import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

import type { GroupListLoader } from "../loaders";
import { GroupCard } from "./group-card";

export function GroupList() {
	const { groups } = useLoaderData<GroupListLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
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
