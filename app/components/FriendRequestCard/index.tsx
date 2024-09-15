import { Form, useNavigation } from "@remix-run/react";
import type { User } from "~/api/@types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

interface Props {
	user: User;
}

export function FriendRequestCard({ user }: Props) {
	const { state } = useNavigation();

	return (
		<div className="flex flex-row w-full bg-white px-6 py-3 gap-5 items-center rounded-md border border-gray-200">
			<Avatar className="border h-10 w-10 border-gray-200">
				<AvatarImage src={user.photoUrl} />
				<AvatarFallback>{user.name} photo</AvatarFallback>
			</Avatar>
			<h1 className="font-bold mr-auto">{user.name}</h1>
			<Form method="post">
				<input type="hidden" name="userId" value={user.userId} />
				<Button
					disabled={state !== "idle"}
					className="font-semibold bg-sky-500 hover:bg-sky-600"
					type="submit"
				>
					申請
				</Button>
			</Form>
		</div>
	);
}
