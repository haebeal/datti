import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

import type { PaymentListLoader } from "../loaders";
import { PaymentCard } from "./payment-card";

export function PaymentList() {
	const { payments } = useLoaderData<PaymentListLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
				<Await resolve={payments}>
					{({ payments }) =>
						Array.isArray(payments) && payments.length > 0 ? (
							<div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
								{payments.map((payment) => (
									<PaymentCard key={payment.paymentId} payment={payment} />
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-semibold text-2xl text-center">
									返済履歴は存在しません❗️
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
