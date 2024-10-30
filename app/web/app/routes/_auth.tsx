import { Outlet } from "@remix-run/react";
import { Header } from "~/components/Header";

export { profileLoader as loader } from "~/features/profile/loaders";

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
