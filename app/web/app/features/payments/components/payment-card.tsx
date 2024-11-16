import type { Payment } from "~/api/@types";

interface Props {
	payment: Payment;
}

export function PaymentCard({ payment }: Props) {
	return (
		<div className="flex flex-row gap-8 items-center">
			<img
				src={payment.paidTo.photoUrl}
				aria-label={`${payment.paidTo.name} photo`}
				className="rounded-full h-16 w-16"
			/>
			<p className="flex md:flex-row flex-col items-start gap-1 md:gap-4 md:items-center flex-1 px-10">
				<span className="text-std-18N-150">
					{new Date(payment.paidAt).toLocaleDateString()}
				</span>
				<span className="text-std-24N-150">{payment.paidTo.name}</span>
				<span className="text-std-22B-150 flex-1 text-right">
					￥{payment.amount}
				</span>
			</p>
		</div>
	);
}
