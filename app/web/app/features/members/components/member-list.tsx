import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

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
							<div className="w-full flex flex-col items-center p-4 gap-3">
								{members.map((member) => (
									<MemberCard key={member.userId} user={member} />
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-semibold text-2xl text-center">
									グループメンバーはいません😿
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
