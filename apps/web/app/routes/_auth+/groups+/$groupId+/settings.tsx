import { HTTPError } from "@aspida/fetch";
import { Suspense, useEffect } from "react";
import type { MetaFunction } from "react-router";
import { Await, useActionData, useLoaderData } from "react-router";

import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { Route } from "./+types/settings";

import type { UpdateGroupAction } from "~/features/groups/actions";
import { UpdateGroupForm } from "~/features/groups/components";
import type { GroupLoader } from "~/features/groups/loaders";
export { updateGroupAction as action } from "~/features/groups/actions";
export { groupLoader as loader } from "~/features/groups/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | グループ設定" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupSettings() {
	const { toast } = useToast();

	const { group } = useLoaderData<GroupLoader>();
	const actionData = useActionData<UpdateGroupAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="py-4">
			<Suspense fallback={<Spinner />}>
				<Await resolve={group}>
					{(group) => <UpdateGroupForm defaultValue={group} />}
				</Await>
			</Suspense>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (error instanceof HTTPError && error.response.status === 404) {
		return (
			<div className="flex flex-col gap-3 pt-32">
				<h1 className="text-std-45B-140 text-center">404</h1>
				<h3 className="text-std-22N-150 text-center">
					グループ情報の取得に失敗しました
				</h3>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 pt-32">
			<h1 className="text-std-45B-140 text-center">500</h1>
			<h3 className="text-std-22N-150 text-center">
				不明なエラーが発生しました
			</h3>
		</div>
	);
}
