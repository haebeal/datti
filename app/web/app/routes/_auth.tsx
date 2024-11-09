import { Outlet, Link as RouterLink } from "@remix-run/react";

import { MobileMenu, SideMenu } from "~/components";

export { profileLoader as loader } from "~/features/profile/loaders";

export default function Auth() {
	return (
		<div className="grid grid-cols-12 justify-center container gap-6">
			<header className="col-span-12 my-5">
				<RouterLink to="/" className="text-std-20N-150">
					Datti
				</RouterLink>
				<p className="text-std-16N-170">
					誰にいくら払ったっけ？を記録するサービス
				</p>
			</header>
			<div className="hidden md:flex col-span-3 flex-col my-10">
				<SideMenu />
			</div>
			<div className="col-span-12 md:col-span-9 mb-20">
				<Outlet />
			</div>
			<MobileMenu />
		</div>
	);
}
