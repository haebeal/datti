import type { LinksFunction } from "@remix-run/cloudflare";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";

import { MobileMenu } from "~/components";
import { Toaster } from "~/components/ui/toaster";

import stylesheet from "~/globals.css?url";

export const links: LinksFunction = () => [
	{
		rel: "icon",
		href: "/favicon.svg",
		type: "image/png",
	},
	{
		rel: "stylesheet",
		href: stylesheet,
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="bg-slate-100">
				{children}
				<Toaster />
				<ScrollRestoration />
				<Scripts />
				<MobileMenu />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
