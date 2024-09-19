import type { MetaFunction } from "@remix-run/cloudflare";
import {
	Await,
	Outlet,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import type { GroupAction } from "~/.server/actions";
import type { PaymentsLoader } from "~/.server/loaders";
import { PaymentCreateForm } from "~/components/PaymentCreateForm/PaymentCreateForm";
import { PaymentHistoryList } from "~/components/PaymentHistoryList";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";

export { paymentAction as action } from "~/.server/actions";
export { paymentsLoader as loader } from "~/.server/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | グループ一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
	const { state } = useNavigation();
	const [isOpen, setOpen] = useState(false);
	const { toast } = useToast();

	const { payments } = useLoaderData<PaymentsLoader>();
	const actionData = useActionData<GroupAction>();
	useEffect(() => {
		if (actionData) {
			setOpen(false);
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-7">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">返済一覧</h1>
				<Dialog open={isOpen} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button
							disabled={state === "loading"}
							className="bg-sky-500 hover:bg-sky-600 font-semibold"
						>
							返済作成
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>返済作成</DialogTitle>
						</DialogHeader>
						<Suspense fallback={<p>loading...</p>}>
							<Await resolve={payments}>
								{({ payments }) => <PaymentCreateForm payments={payments} />}
							</Await>
						</Suspense>
					</DialogContent>
				</Dialog>
			</div>
			<div className="rounded-lg bg-white py-3 px-5">
				<PaymentHistoryList />
			</div>
			<Outlet />
		</div>
	);
}
