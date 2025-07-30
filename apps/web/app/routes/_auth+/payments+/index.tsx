import type { MetaFunction } from "react-router";
import { useNavigate } from "react-router";

import { Button } from "~/components";

import { PaymentList } from "~/features/payments/components";
export { createPaymentAction as action } from "~/features/payments/actions";
export { paymentListLoader as loader } from "~/features/payments/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 返済履歴" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function PaymentsHistory() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">返済履歴</h1>
				<Button
					size="md"
					onClick={() => navigate("/payments/create")}
					variant="solid-fill"
				>
					返済登録
				</Button>
			</div>
			<PaymentList />
		</div>
	);
}
