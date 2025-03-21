import { Await, useLoaderData } from "react-router";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

import type { ApplyingListLoader } from "../loaders";
import { ApplyingCard } from "./applying-card";

export function ApplyingList() {
	const { applyingList } = useLoaderData<ApplyingListLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
				<Await resolve={applyingList}>
					{({ users }) =>
						Array.isArray(users) && users.length > 0 ? (
							<div className="flex flex-col gap-8 py-5">
								{users.map((user) => (
									<Fragment key={user.userId}>
										<ApplyingCard user={user} />
										<Divider />
									</Fragment>
								))}
							</div>
						) : (
							<div className="w-full">
								<h2 className="mt-36 text-std-24N-150 text-center">
									承認待ちのユーザーはいません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
