import { Outlet, Link as RouterLink } from "react-router";

import { Button, MobileMenu, SideMenu } from "~/components";

export { profileLoader as loader } from "~/features/profile/loaders";

export default function Auth() {
	return (
		<div className="grid grid-cols-12 justify-center container gap-6">
			<header className="col-span-12 mt-3 md:my-5 flex align-middle justify-between">
				<div className="">
					<RouterLink to="/" className="text-std-20N-150">
						Datti
					</RouterLink>
					<p className="text-std-16N-170 hidden md:block">
						誰にいくら払ったっけ？を記録するサービス
					</p>
				</div>
				<form action="/auth/signout" method="post">
					<Button
						type="submit"
						variant="solid-fill"
						size="sm"
						className="bg-red-900 hover:bg-red-1000 active:bg-red-1100 md:hidden"
					>
						ログアウト
					</Button>
				</form>
			</header>
			<div className="hidden md:flex col-span-3 flex-col my-10">
				<SideMenu />
			</div>
			<div className="col-span-12 md:col-span-9 mb-24 md:mb-20">
				<Outlet />
			</div>
			<div className="md:hidden">
				<MobileMenu />
			</div>
		</div>
	);
}
