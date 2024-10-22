import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Spinner } from "~/components";

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
							<div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
								{payments.map((paymentUser) => (
									<PaymentUserCard key={paymentUser.user.userId} paymentUser={paymentUser} />
								))}
							</div>
						) : (
							<div className="w-full min-h-[60vh] grid place-content-center">
								<h2 className="font-semibold text-2xl text-center">
									返済は存在しません❗️
								</h2>
							</div>
						)
					}
				</Await>
			</Suspense>
		</div>
	);
}
