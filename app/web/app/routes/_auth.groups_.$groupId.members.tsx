import type { MetaFunction } from "@remix-run/cloudflare";
import { Outlet, useActionData, useNavigation } from "@remix-run/react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
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
	const { state } = useNavigation();
	const { toast } = useToast();

	const actionData = useActionData<AddMemberAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-3">
			<div className="flex flex-row-reverse items-center justify-items-end">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							disabled={state !== "idle"}
							className="bg-sky-500 hover:bg-sky-600 font-semibold"
						>
							メンバー追加
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>メンバー追加</DialogTitle>
						</DialogHeader>
						<AddMemberForm />
					</DialogContent>
				</Dialog>
			</div>
			<MemberList />
			<Outlet />
		</div>
	);
}
