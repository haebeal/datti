import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	groupMembersQueryOptions,
} from "@/features/group/queries";
import { LendingForm } from "@/features/lending/components/lending-form";
import { useUpdateLending } from "@/features/lending/mutations";
import { lendingQueryOptions } from "@/features/lending/queries";
import { meQueryOptions } from "@/features/user/queries";

export const Route = createFileRoute(
	"/_authenticated/groups/$groupId/lendings/$lendingId/edit",
)({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(
				lendingQueryOptions(params.groupId, params.lendingId),
			),
			context.queryClient.ensureQueryData(
				groupMembersQueryOptions(params.groupId),
			),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: EditLendingPage,
});

function EditLendingPage() {
	const { groupId, lendingId } = Route.useParams();
	const navigate = useNavigate();
	const { data: lending } = useSuspenseQuery(
		lendingQueryOptions(groupId, lendingId),
	);
	const { data: members } = useSuspenseQuery(
		groupMembersQueryOptions(groupId),
	);
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const updateLending = useUpdateLending(groupId, lendingId);

	const defaultValues = {
		name: lending.name,
		amount: lending.amount,
		eventDate: lending.eventDate.split("T")[0],
		debts: lending.debts,
	};

	return (
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				立て替えを編集
			</h1>
			<LendingForm
				members={members}
				currentUserId={me.id}
				defaultValues={defaultValues}
				submitLabel="更新"
				onSubmit={async (values) => {
					await updateLending.mutateAsync(values);
					navigate({
						to: "/groups/$groupId/lendings/$lendingId",
						params: { groupId, lendingId },
					});
				}}
			/>
		</div>
	);
}
