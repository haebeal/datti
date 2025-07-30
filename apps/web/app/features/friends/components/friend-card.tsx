import { Form } from "react-router";
import { useRef } from "react";

import type { User } from "~/api/@types";

import { Button, Dialog, DialogBody } from "~/components";

interface Props {
	user: User;
}

export function FriendCard({ user }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);

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
			<Button
				size="md"
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					dialogRef.current?.showModal();
				}}
				variant="solid-fill"
				className="bg-red-900 hover:bg-red-1000 active:bg-red-1100"
			>
				削除
			</Button>
			<Dialog
				aria-labelledby="confirm-delete-event"
				className="w-full max-w-[calc(560/16*1rem)]"
				ref={dialogRef}
			>
				<DialogBody>
					<h2 className="text-std-24N-150">イベントを削除しますか?</h2>
					<p>
						フレンドを解除すると相手からもフレンドではなくなります。
						<br />
						本当によろしいですか？
					</p>
					<Form method="delete">
						<input type="hidden" name="userId" value={user.userId} />
						<Button
							size="md"
							type="submit"
							variant="solid-fill"
							className="bg-red-900 hover:bg-red-1000 active:bg-red-1100"
						>
							削除
						</Button>
					</Form>
					<Button
						size="md"
						onClick={() => dialogRef.current?.close()}
						variant="outline"
					>
						キャンセル
					</Button>
				</DialogBody>
			</Dialog>
		</div>
	);
}
