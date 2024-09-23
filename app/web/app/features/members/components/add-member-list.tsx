import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

import type { MemberListLoader } from "../loaders";
import { AddMemberCard } from "./add-member-card";

export function AddMemberList() {
	const { users, members } = useLoaderData<MemberListLoader>();

	return (
		<Suspense fallback={<Spinner />}>
			<Await resolve={users}>
				{({ users }) => (
					<Await resolve={members}>
						{({ members }) =>
							Array.isArray(users) &&
							Array.isArray(members) &&
							users.length > 0 ? (
								users
									.filter((user) =>
										members.every((member) => user.userId !== member.userId),
									)
									.map((user) => (
										<AddMemberCard key={user.userId} user={user} />
									))
							) : (
								<div className="w-full h-full grid place-content-center">
									<h3 className="font-semibold">
										ユーザーが見つかりませんでした
									</h3>
								</div>
							)
						}
					</Await>
				)}
			</Await>
		</Suspense>
	);
}
