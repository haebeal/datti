import type { MetaFunction } from "@remix-run/cloudflare";
import { useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { BreadcrumbLink, Button, Dialog, DialogBody } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { CreateGroupAction } from "~/features/groups/actions";
import { CreateGroupForm, GroupList } from "~/features/groups/components";
export { createGroupAction as action } from "~/features/groups/actions";
export { groupListLoader as loader } from "~/features/groups/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | グループ一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export const handle = {
	breadcrumb: () => (
		<BreadcrumbLink href="/groups" key="groups">
			グループ一覧
		</BreadcrumbLink>
	),
};

export default function Group() {
	const { toast } = useToast();

	const dialogRef = useRef<HTMLDialogElement>(null);

	const actionData = useActionData<CreateGroupAction>();
	useEffect(() => {
		if (actionData) {
			dialogRef.current?.close();
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-row items-center justify-between py-5 px-3">
				<h1 className="text-std-32N-150">グループ一覧</h1>
				<Button
					size="md"
					onClick={() => dialogRef.current?.showModal()}
					variant="solid-fill"
				>
					グループ作成
				</Button>
			</div>
			<Dialog
				aria-labelledby="create-group-dialog"
				className="w-full max-w-[calc(560/16*1rem)]"
				ref={dialogRef}
			>
				<DialogBody>
					<h2 className="text-std-24N-150">グループ作成</h2>
					<CreateGroupForm />
					<Button
						size="md"
						onClick={() => dialogRef.current?.close()}
						variant="outline"
						className="w-full"
					>
						キャンセル
					</Button>
				</DialogBody>
			</Dialog>
			<GroupList />
		</div>
	);
}
