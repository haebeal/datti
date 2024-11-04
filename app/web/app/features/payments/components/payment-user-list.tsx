import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

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
							<div className="flex flex-col gap-9 py-5">
								{payments.map((payment) => (
									<>
										<PaymentUserCard
											key={`${payment.user.userId}-card`}
											paymentUser={payment}
										/>
										<Divider key={`${payment.user.userId}-divider`} />
									</>
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="text-std-24N-150 text-2xl text-center">
									返済は存在しません
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
