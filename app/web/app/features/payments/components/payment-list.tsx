import { Await, useLoaderData } from "react-router";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

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
							<div className="flex flex-col gap-8 py-5">
								{payments.map((payment) => (
									<Fragment key={payment.paymentId}>
										<PaymentCard payment={payment} />
										<Divider />
									</Fragment>
								))}
							</div>
						) : (
							<div className="w-full">
								<h2 className="mt-36 text-std-24N-150 text-center">
									返済履歴が存在しません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
