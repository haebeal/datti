import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/profile/")({
	loader: () => {
		throw redirect({ to: "/profile/account" });
	},
	component: () => null,
});
