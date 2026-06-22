import { createFileRoute } from "@tanstack/react-router";
import { HelpPanel } from "@/features/user/components/settings-sections";

export const Route = createFileRoute("/_authenticated/profile/help")({
	component: HelpPanel,
});
