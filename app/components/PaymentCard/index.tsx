import { PaymentUser } from "~/api/@types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface Props {
  payment: PaymentUser;
}

export function PaymentCard({ payment }: Props) {
  return (
    <div className="flex flex-row  w-full bg-white px-6 py-5 gap-8 items-center rounded-md border border-gray-200">
      <Avatar className="border h-14 w-14 border-gray-200">
        <AvatarImage src={payment.user.photoUrl} />
        <AvatarFallback>{payment.user.name} photo</AvatarFallback>
      </Avatar>
      <h1 className="text-xl font-bold">{payment.user.name}</h1>
      <h1 className="text-xl font-bold ml-auto mr-32">￥{payment.amount}</h1>
    </div>
  );
}
