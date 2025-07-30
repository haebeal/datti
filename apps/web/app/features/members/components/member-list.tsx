import { Await, Link, useLoaderData, useLocation } from "react-router";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

import type { MemberListLoader } from "~/features/members/loaders";
import { MemberCard } from "./member-card";

export function MemberList() {
	const { pathname } = useLocation();
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
								<Link
									to={`${pathname}/add`}
									className="flex flex-row justify-center items-center"
								>
									<span className="px-3 py-1 rounded-2xl">
										<svg
											role="img"
											aria-label="メンバー追加"
											xmlns="http://www.w3.org/2000/svg"
											height="32px"
											width="32px"
											viewBox="0 -960 960 960"
											className="fill-blue-900"
										>
											<path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
										</svg>
									</span>
								</Link>
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
