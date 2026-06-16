import { userManager } from "./cognito";

export function login(identityProvider?: "Google" | "LINE") {
	return userManager.signinRedirect({
		extraQueryParams: identityProvider
			? { identity_provider: identityProvider }
			: undefined,
	});
}

export function logout() {
	return userManager.signoutRedirect();
}
