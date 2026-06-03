import { createFileRoute, redirect } from "@tanstack/react-router";
import { userManager } from "@/libs/auth/cognito";

export const Route = createFileRoute("/auth/callback")({
	loader: async () => {
		try {
			await userManager.signinRedirectCallback();
		} catch (err) {
			console.error("auth callback error", err);
			throw redirect({ to: "/auth", search: { error: "auth_failed" } });
		}
		throw redirect({ to: "/" });
	},
});
