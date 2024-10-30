import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";

import type { CreatePaymentSchema } from "~/features/payments/actions";
import { PaymentList } from "~/features/payments/components";
export { createPaymentAction as action } from "~/features/payments/actions";
export { paymentListLoader as loader } from "~/features/payments/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 返済作成" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
	const { toast } = useToast();

	const actionData = useActionData<CreatePaymentSchema>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<div className="flex flex-col py-3 gap-7">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">返済一覧</h1>
				<Button className="bg-sky-500 hover:bg-sky-600 font-semibold">
					<Link to="/payments/create">返済作成</Link>
				</Button>
			</div>
			<div className="rounded-lg bg-white py-3 px-5">
				<PaymentList />
			</div>
			<Outlet />
		</div>
	);
}
