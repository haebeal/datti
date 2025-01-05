import { Await, useLoaderData } from "react-router";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

import type { AddMemberLoader } from "../loaders";
import { AddMemberCard } from "./add-member-card";

export function AddMemberList() {
	const { users, members } = useLoaderData<AddMemberLoader>();

	return (
		<div className="w-full">
			<Suspense fallback={<Spinner />}>
				<Await resolve={users}>
					{({ users }) => (
						<Await resolve={members}>
							{({ members }) =>
								Array.isArray(users) &&
								Array.isArray(members) &&
								users.filter((user) =>
									members.every((member) => user.userId !== member.userId),
								).length > 0 ? (
									<div className="flex flex-col gap-5 py-5">
										{users
											.filter((user) =>
												members.every(
													(member) => user.userId !== member.userId,
												),
											)
											.map((user) => (
												<Fragment key={user.userId}>
													<AddMemberCard user={user} />
													<Divider />
												</Fragment>
											))}
									</div>
								) : (
									<div className="w-full">
										<h2 className="mt-36 text-std-24N-150 text-center">
											ユーザーが見つかりませんでした
										</h2>
									</div>
								)
							}
						</Await>
					)}
				</Await>
			</Suspense>
		</div>
	);
}
