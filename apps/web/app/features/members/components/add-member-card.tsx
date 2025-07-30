import { Form, useNavigation } from "react-router";

import { Button } from "~/components";

import type { User } from "~/api/@types";

interface Props {
	user: User;
}

export function AddMemberCard({ user }: Props) {
	const { state } = useNavigation();
	return (
		<div className="flex flex-row gap-5 items-center">
			<img
				src={user.photoUrl}
				aria-label={`${user.name} photo`}
				className="rounded-full h-14 w-14"
			/>
			<p className="flex md:flex-row flex-col items-start md:items-center flex-1 px-10">
				<span className="text-std-18N-160">{user.name}</span>
			</p>
			<Form method="post">
				<input readOnly type="hidden" name="userId" value={user.userId} />
				<Button
					size="md"
					variant="solid-fill"
					disabled={state !== "idle"}
					type="submit"
				>
					追加
				</Button>
			</Form>
		</div>
	);
}
