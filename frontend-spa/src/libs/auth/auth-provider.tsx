import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
	type AuthState,
	type AuthUser,
	AuthContext,
} from "./auth-context";
import { userManager } from "./cognito";
import { setCurrentAccessToken } from "./token-store";

function toAuthUser(profile: Record<string, unknown> | undefined): AuthUser | null {
	if (!profile) return null;
	const sub = profile.sub as string | undefined;
	const email = profile.email as string | undefined;
	const name = (profile.name as string | undefined) ??
		(profile["cognito:username"] as string | undefined) ??
		email;
	const picture = profile.picture as string | undefined;
	if (!sub || !email || !name) return null;
	return { sub, email, name, picture };
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		userManager
			.getUser()
			.then((u) => {
				if (!mounted) return;
				if (u && !u.expired) {
					setCurrentAccessToken(u.access_token);
					setUser(toAuthUser(u.profile));
				} else {
					setCurrentAccessToken(undefined);
					setUser(null);
				}
			})
			.finally(() => {
				if (mounted) setIsLoading(false);
			});

		const onLoaded = (u: { access_token: string; profile: Record<string, unknown> }) => {
			setCurrentAccessToken(u.access_token);
			setUser(toAuthUser(u.profile));
		};
		const onUnloaded = () => {
			setCurrentAccessToken(undefined);
			setUser(null);
		};
		const onExpired = () => {
			setCurrentAccessToken(undefined);
			setUser(null);
		};

		userManager.events.addUserLoaded(onLoaded);
		userManager.events.addUserUnloaded(onUnloaded);
		userManager.events.addAccessTokenExpired(onExpired);
		userManager.events.addSilentRenewError((err) => {
			console.error("silent renew error", err);
		});

		return () => {
			mounted = false;
			userManager.events.removeUserLoaded(onLoaded);
			userManager.events.removeUserUnloaded(onUnloaded);
			userManager.events.removeAccessTokenExpired(onExpired);
		};
	}, []);

	const login = useCallback(async (identityProvider?: "Google" | "LINE") => {
		await userManager.signinRedirect({
			extraQueryParams: identityProvider
				? { identity_provider: identityProvider }
				: undefined,
		});
	}, []);

	const logout = useCallback(async () => {
		await userManager.signoutRedirect();
	}, []);

	const value: AuthState = {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
