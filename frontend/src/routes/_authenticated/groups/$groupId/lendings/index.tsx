import { createFileRoute } from "@tanstack/react-router";
import { GroupDetailView } from "@/features/group/components/group-detail-view";
import {
	groupMembersQueryOptions,
	groupQueryOptions,
} from "@/features/group/queries";
import { lendingsByGroupQueryOptions } from "@/features/lending/queries";
import { meQueryOptions } from "@/features/user/queries";

export const Route = createFileRoute(
	"/_authenticated/groups/$groupId/lendings/",
)({
	loader: async ({ context, params }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(groupQueryOptions(params.groupId)),
			context.queryClient.ensureQueryData(
				groupMembersQueryOptions(params.groupId),
			),
			context.queryClient.ensureQueryData(
				lendingsByGroupQueryOptions(params.groupId),
			),
			context.queryClient.ensureQueryData(meQueryOptions),
		]);
	},
	component: GroupLendingsPage,
});

function GroupLendingsPage() {
	const { groupId } = Route.useParams();
	return <GroupDetailView groupId={groupId} />;
}
