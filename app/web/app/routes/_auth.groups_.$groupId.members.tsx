import type { MetaFunction } from "@remix-run/cloudflare";
import { Outlet, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { Button, Dialog, DialogBody } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { AddMemberAction } from "~/features/members/actions";
import { AddMemberForm, MemberList } from "~/features/members/components";
export { addMemberAction as action } from "~/features/members/actions";
export { memberListLoader as loader } from "~/features/members/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | メンバー設定" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupMembers() {
	const { toast } = useToast();

	const dialogRef = useRef<HTMLDialogElement>(null);

	const actionData = useActionData<AddMemberAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
			dialogRef.current?.close();
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-3">
			<div className="flex flex-row-reverse items-center justify-items-end">
				<Button
					size="md"
					onClick={() => dialogRef.current?.showModal()}
					variant="solid-fill"
				>
					メンバー追加
				</Button>
			</div>
			<Dialog
				aria-labelledby="add-member-dialog"
				className="w-full max-w-[calc(560/16*1rem)]"
				ref={dialogRef}
			>
				<DialogBody>
					<h2 className="text-std-24N-150">メンバー追加</h2>
					<AddMemberForm />
				</DialogBody>
			</Dialog>
			<MemberList />
			<Outlet />
		</div>
	);
}
