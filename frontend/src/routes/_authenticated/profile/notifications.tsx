import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPanel } from "@/features/user/components/settings-sections";

export const Route = createFileRoute("/_authenticated/profile/notifications")({
	component: NotificationsPanel,
});
