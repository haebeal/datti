import type { MetaFunction } from "react-router";

import { BreadcrumbLink } from "~/components";

import { PaymentUserList } from "~/features/payments/components";
export { paymentUserListLoader as loader } from "~/features/payments/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | 現在の返済一覧" },
	{
		name: "description",
		content: "誰にいくら払ったっけ？を記録するサービス",
	},
];

export const handle = {
	breadcrumb: () => (
		<BreadcrumbLink href="/" key="home">
			ホーム
		</BreadcrumbLink>
	),
};

export default function Index() {
	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">現在の返済一覧</h1>
			</div>
			<PaymentUserList />
		</div>
	);
}
