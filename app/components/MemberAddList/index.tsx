import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import type { MembersLoader } from "~/.server/loaders";
import { MemberAddCard } from "~/components/MemberAddCard";

function LoadingSpinner() {
	return (
		<div className="w-full h-full grid place-content-center">
			<div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
		</div>
	);
}

export function MemberAddList() {
	const { users, members } = useLoaderData<MembersLoader>();

	return (
		<Suspense fallback={<LoadingSpinner />}>
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
										<MemberAddCard key={user.userId} user={user} />
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
