import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHead } from "@/components/ui/page-head";
import { Panel } from "@/components/ui/panel";
import {
	groupMembersQueryOptions,
	groupQueryOptions,
} from "@/features/group/queries";
import { LendingForm } from "@/features/lending/components/lending-form";
import { useCreateLending } from "@/features/lending/mutations";
import { meQueryOptions } from "@/features/user/queries";

export const Route = createFileRoute(
	"/_authenticated/groups/$groupId/lendings/new",
)({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(groupQueryOptions(params.groupId)),
			context.queryClient.ensureQueryData(
				groupMembersQueryOptions(params.groupId),
			),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: NewLendingPage,
});

function NewLendingPage() {
	const { groupId } = Route.useParams();
	const navigate = useNavigate();
	const { data: members } = useSuspenseQuery(
		groupMembersQueryOptions(groupId),
	);
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const createLending = useCreateLending(groupId);

	return (
		<div className="mx-auto max-w-[560px]">
			<PageHead title="立て替えを追加" />
			<Panel className="p-6">
				<LendingForm
					members={members}
					currentUserId={me.id}
					submitLabel="作成"
					onSubmit={async (values) => {
						const created = await createLending.mutateAsync(values);
						navigate({
							to: "/groups/$groupId/lendings/$lendingId",
							params: { groupId, lendingId: created.id },
						});
					}}
				/>
			</Panel>
		</div>
	);
}
