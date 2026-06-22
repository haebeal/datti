import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui/panel";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import { meQueryOptions } from "@/features/user/queries";

export const Route = createFileRoute("/_authenticated/profile/account")({
	loader: ({ context }) => context.queryClient.ensureQueryData(meQueryOptions),
	component: AccountSection,
});

function AccountSection() {
	const { data: me } = useSuspenseQuery(meQueryOptions);
	return (
		<Panel className="p-6">
			<h2 className="mb-5 font-heading text-[17px] font-bold text-foreground">
				アカウント設定
			</h2>
			<ProfileEditForm user={me} />
		</Panel>
	);
}
