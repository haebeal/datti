import { Form, useNavigation } from "react-router";

import type { User } from "~/api/@types";

import { Button } from "~/components";

interface Props {
	user: User;
}

export function ApplyingCard({ user }: Props) {
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
					disabled={state === "submitting"}
					type="submit"
				>
					承認
				</Button>
			</Form>
			<Form method="delete">
				<input type="hidden" name="userId" value={user.userId} />
				<Button
					size="md"
					variant="solid-fill"
					disabled={state === "submitting"}
					className="bg-red-900 hover:bg-red-1000 active:bg-red-1100 w-full"
					type="submit"
				>
					却下
				</Button>
			</Form>
		</div>
	);
}
