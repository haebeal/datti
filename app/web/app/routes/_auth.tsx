import { Outlet } from "@remix-run/react";
import { Header } from "~/components/Header";

export { authLoader as loader } from "~/.server/loaders";

export default function Auth() {
	return (
		<div className="min-h-screen">
			<Header />
			<div className="container py-3">
				<Outlet />
			</div>
		</div>
	);
}
