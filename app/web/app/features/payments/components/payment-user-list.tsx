import { Await, useLoaderData } from "@remix-run/react";
import { Fragment, Suspense } from "react";

import { Divider, Spinner } from "~/components";

import type { PaymentUserListLoader } from "../loaders";
import { PaymentUserCard } from "./payment-user-card";

export function PaymentUserList() {
	const { paymentUsers } = useLoaderData<PaymentUserListLoader>();

	return (
		<div className="w-full min-h-[60vh]">
			<Suspense fallback={<Spinner />}>
				<Await resolve={paymentUsers}>
					{({ payments }) =>
						Array.isArray(payments) && payments.length > 0 ? (
							<div className="flex flex-col gap-8 py-5">
								{payments.map((payment) => (
									<Fragment key={payment.user.userId}>
										<PaymentUserCard paymentUser={payment} />
										<Divider />
									</Fragment>
								))}
							</div>
						) : (
							<div className="w-full">
								<h2 className="mt-36 text-std-24N-150 text-center">
									現在の返済はありません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
