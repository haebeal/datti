import type { PaymentUser } from "~/api/@types";

interface Props {
	paymentUser: PaymentUser;
}

export function PaymentUserCard({ paymentUser: { user, amount } }: Props) {
	return (
		<div className="flex flex-row gap-5 items-center">
			<img
				src={user.photoUrl}
				aria-label={`${user.name} photo`}
				className="rounded-full h-16 w-16"
			/>
			<p className="flex md:flex-row flex-col items-start md:items-center flex-1 px-10">
				<span className="text-std-20N-150">{user.name}</span>
				<span className="text-std-22B-150 flex-1 text-right">￥{amount}</span>
			</p>
		</div>
	);
}
