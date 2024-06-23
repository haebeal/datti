import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { PaymentsLoader } from "~/.server/loaders";
import { PaymentCard } from "~/components/PaymentCard";

function LoadingSpinner() {
  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export function PaymentList() {
  const { payments } = useLoaderData<PaymentsLoader>();

  return (
    <div className="w-full min-h-[60vh]">
      <Suspense fallback={<LoadingSpinner />}>
        <Await resolve={payments}>
          {({ payments }) =>
            Array.isArray(payments) && payments.length > 0 ? (
              <div className="w-full min-h-[60vh] flex flex-col items-center p-4 gap-3">
                {payments.map((payment, index) => (
                  <PaymentCard key={index} payment={payment} />
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
