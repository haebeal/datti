import type { MetaFunction } from "@remix-run/cloudflare";
import { useActionData, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

import { useToast } from "~/components/ui/use-toast";

import type { AddMemberAction } from "~/features/members/actions";
import { AddMemberList } from "~/features/members/components";
import { SearchUserForm } from "~/features/users/components";
export { addMemberAction as action } from "~/features/members/actions";
export { addMemberLoader as loader } from "~/features/members/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | メンバー追加" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function AddMember() {
	const { toast } = useToast();
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const actionData = useActionData<AddMemberAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
			navigate(pathname.slice(0, -4));
		}
	}, [actionData, pathname, toast, navigate]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">メンバー追加</h1>
			</div>
			<SearchUserForm />
			<AddMemberList />
		</div>
	);
}
