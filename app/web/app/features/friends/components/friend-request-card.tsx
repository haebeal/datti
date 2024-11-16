import { Form, useNavigation } from "@remix-run/react";

import type { User } from "~/api/@types";

import { Button } from "~/components";

interface Props {
	user: User;
}

export function FriendRequestCard({ user }: Props) {
	const { state } = useNavigation();

	return (
		<div className="flex flex-row gap-5 items-center">
			<img
				src={user.photoUrl}
				aria-label={`${user.name} photo`}
				className="rounded-full h-16 w-16"
			/>
			<p className="flex md:flex-row flex-col items-start md:items-center flex-1 px-10">
				<span className="text-std-20N-150">{user.name}</span>
			</p>

			<Form method="post">
				<input type="hidden" name="userId" value={user.userId} />
				<Button
					size="md"
					variant="solid-fill"
					disabled={state !== "idle"}
					type="submit"
				>
					申請
				</Button>
			</Form>
		</div>
	);
}
