import {
	Await,
	Form,
	useLoaderData,
	useLocation,
	useNavigation,
} from "@remix-run/react";
import { Suspense, useId } from "react";

import { Spinner } from "~/components";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

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
		<div className="flex flex-col items-center p-4 gap-9">
			<Form method="get" className="w-full">
				<div className="w-full flex items-end gap-3">
					<div className="grow">
						<Label htmlFor={searchId}>検索</Label>
						<Input
							placeholder="メールアドレスを入力"
							defaultValue={searchQuery}
							name="q"
							disabled={state !== "idle"}
						/>
					</div>
					<input readOnly hidden name="status" value={status} />
					<Button
						type="submit"
						className="bg-sky-500 hover:bg-sky-600  font-semibold"
						disabled={state !== "idle"}
					>
						検索
					</Button>
				</div>
			</Form>
			<div className="flex flex-col gap-3 w-full h-80 overflow-y-auto">
				<Suspense fallback={<Spinner />}>
					<Await resolve={users}>
						{({ users }) =>
							Array.isArray(users) && users.length > 0 ? (
								users.map((user) => (
									<FriendRequestCard key={user.userId} user={user} />
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
				</Suspense>
			</div>
		</div>
	);
}
