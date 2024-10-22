import type { MetaFunction } from "@remix-run/cloudflare";
import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { useToast } from "~/components/ui/use-toast";

import type { CreatePaymentSchema } from "~/features/payments/actions";
import { CreatePaymentForm } from "~/features/payments/components";
import type { PaymentUserListLoader } from "~/features/payments/loaders";
export { createPaymentAction as action } from "~/features/payments/actions";
export { paymentUserListLoader as loader } from "~/features/payments/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 返済一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
	const { toast } = useToast();

	const { paymentUsers } = useLoaderData<PaymentUserListLoader>();
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
				<h1 className="font-bold text-2xl">返済作成</h1>
			</div>
			<div className="rounded-lg bg-white py-3 px-5">
				<Suspense fallback={<p>loading...</p>}>
					<Await resolve={paymentUsers}>
						{({ payments }) => <CreatePaymentForm paymentUsers={payments} />}
					</Await>
				</Suspense>
			</div>
		</div>
	);
}
