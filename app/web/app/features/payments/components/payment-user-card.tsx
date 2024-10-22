import type { PaymentUser } from "~/api/@types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface Props {
	paymentUser: PaymentUser;
}

export function PaymentUserCard({ paymentUser: {user, amount} }: Props) {
	return (
		<div className="flex flex-row  w-full bg-white px-6 py-5 gap-8 items-center rounded-md border border-gray-200">
			<Avatar className="border h-14 w-14 border-gray-200">
				<AvatarImage src={user.photoUrl} />
				<AvatarFallback>{user.name} photo</AvatarFallback>
			</Avatar>
			<h1 className="text-xl font-bold">{user.name}</h1>
			<h1 className="text-xl font-bold ml-auto mr-32">￥{amount}</h1>
		</div>
	);
}
