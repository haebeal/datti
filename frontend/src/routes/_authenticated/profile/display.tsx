import { createFileRoute } from "@tanstack/react-router";
import { DisplayPanel } from "@/features/user/components/settings-sections";

export const Route = createFileRoute("/_authenticated/profile/display")({
	component: DisplayPanel,
});
