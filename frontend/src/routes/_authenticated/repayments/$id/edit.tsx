import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RepaymentEditForm } from "@/features/repayment/components/repayment-edit-form";
import { useUpdateRepayment } from "@/features/repayment/mutations";
import { repaymentQueryOptions } from "@/features/repayment/queries";

export const Route = createFileRoute("/_authenticated/repayments/$id/edit")({
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(repaymentQueryOptions(params.id));
	},
	component: EditRepaymentPage,
});

function EditRepaymentPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const { data: repayment } = useSuspenseQuery(repaymentQueryOptions(id));
	const updateRepayment = useUpdateRepayment(id);

	return (
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				返した記録を編集
			</h1>
			<RepaymentEditForm
				defaultAmount={repayment.amount}
				onSubmit={async (values) => {
					await updateRepayment.mutateAsync(values);
					navigate({ to: "/repayments/$id", params: { id } });
				}}
			/>
		</div>
	);
}
