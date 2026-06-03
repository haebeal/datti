import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./libs/auth/auth-provider";
import { Loading } from "./components/loading";
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
	context: { queryClient },
	defaultPreload: "intent",
	defaultPendingComponent: Loading,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
);
