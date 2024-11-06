import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Divider, Spinner } from "~/components";

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
							<div className="flex flex-col gap-1 py-5">
								{groups.map((group) => (
									<>
										<GroupCard key={`${group.groupId}-card`} group={group} />
										<Divider key={`${group.groupId}-divider`} />
									</>
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-std-24N-150 text-center">
									グループに参加していません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
