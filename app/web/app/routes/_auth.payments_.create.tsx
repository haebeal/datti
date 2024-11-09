import type { MetaFunction } from "@remix-run/cloudflare";
import {
	Await,
	useActionData,
	useLoaderData,
	useLocation,
	useNavigate,
} from "@remix-run/react";
import { Suspense, useEffect } from "react";

import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { CreatePaymentSchema } from "~/features/payments/actions";
import { CreatePaymentForm } from "~/features/payments/components";
import type { PaymentUserListLoader } from "~/features/payments/loaders";
export { createPaymentAction as action } from "~/features/payments/actions";
export { paymentUserListLoader as loader } from "~/features/payments/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 返済作成" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
	const { toast } = useToast();
	const { pathname } = useLocation();
	const navigate = useNavigate();

	const { paymentUsers } = useLoaderData<PaymentUserListLoader>();
	const actionData = useActionData<CreatePaymentSchema>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
			navigate(pathname.slice(0, -7));
		}
	}, [actionData, pathname, toast, navigate]);

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">返済作成</h1>
			</div>
			<Suspense fallback={<Spinner />}>
				<Await resolve={paymentUsers}>
					{({ payments }) => <CreatePaymentForm paymentUsers={payments} />}
				</Await>
			</Suspense>
		</div>
	);
}
