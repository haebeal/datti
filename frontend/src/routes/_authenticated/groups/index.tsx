import { createFileRoute, redirect } from "@tanstack/react-router";
import { groupsQueryOptions } from "@/features/group/queries";

export const Route = createFileRoute("/_authenticated/groups/")({
	loader: async ({ context }) => {
		const groups = await context.queryClient.ensureQueryData(groupsQueryOptions);
		if (groups.length > 0) {
			throw redirect({
				to: "/groups/$groupId/lendings",
				params: { groupId: groups[0].id },
			});
		}
	},
	component: () => null,
});
