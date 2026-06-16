import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { creditsQueryOptions } from "@/features/credit/queries";
import { RepaymentCreateForm } from "@/features/repayment/components/repayment-create-form";
import { useCreateRepayment } from "@/features/repayment/mutations";

const searchSchema = z.object({
	debtorId: z.string().optional(),
	amount: z.number().optional(),
});

export const Route = createFileRoute("/_authenticated/repayments/new")({
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(creditsQueryOptions());
	},
	component: NewRepaymentPage,
});

function NewRepaymentPage() {
	const { debtorId, amount } = Route.useSearch();
	const navigate = useNavigate();
	const { data: credits } = useSuspenseQuery(creditsQueryOptions());
	const createRepayment = useCreateRepayment();

	return (
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				返した記録をつける
			</h1>
			<RepaymentCreateForm
				credits={credits}
				defaultDebtorId={debtorId}
				defaultAmount={amount}
				onSubmit={async (values) => {
					const created = await createRepayment.mutateAsync(values);
					navigate({ to: "/repayments/$id", params: { id: created.id } });
				}}
			/>
		</div>
	);
}
