import { Outlet, useActionData, useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import type { MemberAction } from "~/.server/actions";
import { MemberAddForm } from "~/components/MemberAddForm";
import { MemberList } from "~/components/MemberList";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";

export { memberAction as action } from "~/.server/actions";
export { membersLoader as loader } from "~/.server/loaders";

export default function GroupMembers() {
	const { state } = useNavigation();
	const { toast } = useToast();

	const actionData = useActionData<MemberAction>();
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
						<MemberAddForm />
					</DialogContent>
				</Dialog>
			</div>
			<MemberList />
			<Outlet />
		</div>
	);
}
