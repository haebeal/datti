import { Await, useLoaderData } from "@remix-run/react";
import { Fragment, Suspense } from "react";

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
									<Fragment key={group.groupId}>
										<GroupCard group={group} />
										<Divider />
									</Fragment>
								))}
							</div>
						) : (
							<div className="w-full">
								<h2 className="mt-20 text-std-24N-150 text-center">
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
