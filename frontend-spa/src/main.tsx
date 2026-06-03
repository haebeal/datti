import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./libs/auth/auth-provider";
import { useAuth } from "./libs/auth/auth-context";
import type { AuthState } from "./libs/auth/auth-context";
import "./styles/globals.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60_000,
			retry: 1,
		},
	},
});

const router = createRouter({
	routeTree,
	context: {
		queryClient,
		auth: undefined as unknown as AuthState,
	},
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ queryClient, auth }} />;
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<InnerApp />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
);
