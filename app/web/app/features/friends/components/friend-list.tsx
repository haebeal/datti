import { Await, useLoaderData, useLocation } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

import type { FriendListLoader } from "../loaders";
import { FriendCard } from "./friend-card";

export function FriendList() {
	const { friends, applyings, requestings } = useLoaderData<FriendListLoader>();

	const { search } = useLocation();
	const searchParams = new URLSearchParams(search);

	const status = searchParams.get("status")?.toString();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
				<Await
					resolve={
						status === "requesting"
							? requestings
							: status === "applying"
								? applyings
								: friends
					}
				>
					{({ users }) =>
						Array.isArray(users) && users.length > 0 ? (
							<div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
								{users.map((user) => (
									<FriendCard key={user.userId} friend={user} />
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-semibold text-2xl text-center">
									{status === "requesting"
										? "申請中のユーザーはいません😿"
										: status === "applying"
											? "受理中のユーザーはいません😿"
											: "フレンドがいません😿"}
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
