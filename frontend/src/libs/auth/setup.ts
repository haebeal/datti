import type { QueryClient } from "@tanstack/react-query";
import { userManager } from "./cognito";
import { authUserQueryKey } from "./queries";

export function setupAuth(queryClient: QueryClient) {
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: authUserQueryKey });

	userManager.events.addUserLoaded(invalidate);
	userManager.events.addUserUnloaded(invalidate);
	userManager.events.addAccessTokenExpired(invalidate);
	userManager.events.addSilentRenewError((err) =>
		console.error("silent renew error", err),
	);
}
