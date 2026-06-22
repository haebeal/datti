import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AccountConnectPanel } from "@/features/user/components/account-connect-panel";
import { meQueryOptions } from "@/features/user/queries";

export const Route = createFileRoute("/_authenticated/profile/connect")({
	loader: ({ context }) => context.queryClient.ensureQueryData(meQueryOptions),
	component: ConnectSection,
});

function ConnectSection() {
	const { data: me } = useSuspenseQuery(meQueryOptions);
	return <AccountConnectPanel user={me} />;
}
