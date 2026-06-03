import { createContext, useContext } from "react";

export interface AuthUser {
	sub: string;
	email: string;
	name: string;
	picture?: string;
}

export interface AuthState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (identityProvider?: "Google" | "LINE") => Promise<void>;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
	return ctx;
}
