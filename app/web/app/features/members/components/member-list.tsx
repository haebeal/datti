import { Await, useLoaderData } from "@remix-run/react";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

import type { MemberListLoader } from "~/features/members/loaders";
import { MemberCard } from "./member-card";

export function MemberList() {
	const { members } = useLoaderData<MemberListLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
				<Await resolve={members}>
					{({ members }) =>
						Array.isArray(members) && members.length > 0 ? (
							<div className="flex flex-col gap-8 py-5">
								{members.map((member) => (
									<Fragment key={member.userId}>
										<MemberCard user={member} />
										<Divider />
									</Fragment>
								))}
							</div>
						) : (
							<div className="w-full">
								<h2 className="mt-36 text-std-24N-150 text-center">
									グループメンバーが存在しません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
