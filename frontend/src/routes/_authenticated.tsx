import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { MobileMenu } from "@/components/mobile-menu";
import { Sidebar } from "@/components/sidebar";
import { userManager } from "@/libs/auth/cognito";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const user = await userManager.getUser();
		if (!user || user.expired) {
			throw redirect({
				to: "/auth",
				search: { redirect: location.href },
			});
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return (
		<>
			<div className={cn("h-screen", "flex")}>
				<Sidebar />
				<div className={cn("flex-1 min-w-0", "flex flex-col")}>
					<Header />
					<main
						className={cn(
							"flex-1 overflow-y-auto",
							"px-4 sm:px-6 lg:px-10",
							"py-5 sm:py-9",
							"pb-20",
						)}
					>
						<div className={cn("w-full max-w-[1080px] mx-auto")}>
							<Outlet />
						</div>
					</main>
				</div>
			</div>
			<MobileMenu />
		</>
	);
}
