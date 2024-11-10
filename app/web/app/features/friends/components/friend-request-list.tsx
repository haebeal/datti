import {
	Await,
	useLoaderData,
	useLocation,
	useNavigation,
} from "@remix-run/react";
import { Fragment, Suspense, useId } from "react";

import { Divider, Spinner } from "~/components";

import type { FriendRequestLoader } from "../loaders";
import { FriendRequestCard } from "./friend-request-card";

export function FriendRequestList() {
	const { search } = useLocation();
	const { state } = useNavigation();
	const searchParams = new URLSearchParams(search);

	const status = searchParams.get("status")?.toString();
	const searchQuery = searchParams.get("q")?.toString();
	const searchId = useId();
	const { users } = useLoaderData<FriendRequestLoader>();

	return (
		<div className="w-full">
			<Suspense fallback={<Spinner />}>
				<Await resolve={users}>
					{({ users }) =>
						Array.isArray(users) && users.length > 0 ? (
							<div className="flex flex-col gap-5 py-5">
								{users.map((user) => (
									<Fragment key={user.userId}>
										<FriendRequestCard user={user} />
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
			</Suspense>
		</div>
	);
}
