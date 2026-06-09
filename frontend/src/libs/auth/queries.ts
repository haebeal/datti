import { queryOptions } from "@tanstack/react-query";
import { userManager } from "./cognito";

export interface AuthUser {
	sub: string;
	email: string;
	name: string;
	picture?: string;
	accessToken: string;
}

export const authUserQueryKey = ["auth", "user"] as const;

export const authUserQueryOptions = queryOptions({
	queryKey: authUserQueryKey,
	queryFn: async (): Promise<AuthUser | null> => {
		const oidcUser = await userManager.getUser();
		if (!oidcUser || oidcUser.expired) return null;
		const profile = oidcUser.profile as Record<string, unknown>;
		const sub = profile.sub as string | undefined;
		const email = profile.email as string | undefined;
		const name =
			(profile.name as string | undefined) ??
			(profile["cognito:username"] as string | undefined) ??
			email;
		const picture = profile.picture as string | undefined;
		if (!sub || !email || !name) return null;
		return { sub, email, name, picture, accessToken: oidcUser.access_token };
	},
	staleTime: Number.POSITIVE_INFINITY,
});
