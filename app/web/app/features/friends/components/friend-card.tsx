import { Form, useLocation, useNavigation } from "@remix-run/react";
import { useRef } from "react";

import type { User } from "~/api/@types";

import { Button, Dialog, DialogBody } from "~/components";

interface Props {
	friend: User;
}

export function FriendCard({ friend }: Props) {
	const { search } = useLocation();
	const { state } = useNavigation();
	const searchParams = new URLSearchParams(search);

	const status = searchParams.get("status")?.toString();

	const dialogRef = useRef<HTMLDialogElement>(null);

	return (
		<div className="flex flex-row gap-5 items-center">
			<img
				src={friend.photoUrl}
				aria-label={`${friend.name} photo`}
				className="rounded-full h-16 w-16"
			/>
			<p className="flex md:flex-row flex-col items-start md:items-center flex-1 px-10">
				<span className="text-std-20N-150">{friend.name}</span>
			</p>
			{status === "requesting" ? (
				<Form method="delete">
					<input type="hidden" name="userId" value={friend.userId} />
					<Button
						size="md"
						variant="solid-fill"
						disabled={state === "submitting"}
						className="bg-red-900 hover:bg-red-1000 active:bg-red-1100 w-full"
						type="submit"
					>
						取り消し
					</Button>
				</Form>
			) : status === "applying" ? (
				<>
					<Form method="post">
						<input type="hidden" name="userId" value={friend.userId} />
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
						<input type="hidden" name="userId" value={friend.userId} />
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
				</>
			) : (
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
			)}
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
						<input type="hidden" name="userId" value={friend.userId} />
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
