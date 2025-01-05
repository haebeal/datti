import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";

import { Button } from "~/components";

import { cn } from "~/lib/utils";

export default function Friend() {
	const { pathname } = useLocation();
	const navigate = useNavigate();

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">フレンド</h1>
				<Button
					size="md"
					onClick={() => navigate("/friends/request")}
					variant="solid-fill"
				>
					フレンド申請
				</Button>
			</div>
			<div className="flex flex-row gap-5">
				{/* /friendsのみ完全一致である必要があるのでNavLinkは使用しない */}
				<Link
					className={cn(
						"text-std-18B-160",
						pathname !== "/friends" && "opacity-40",
					)}
					to={{
						pathname: "/friends",
					}}
				>
					フレンド
				</Link>
				<NavLink
					className={({ isActive }) =>
						cn("text-std-18B-160", !isActive && "opacity-40")
					}
					to="/friends/requesting"
				>
					申請中
				</NavLink>
				<NavLink
					className={({ isActive }) =>
						cn("text-std-18B-160", !isActive && "opacity-40")
					}
					to="/friends/applying"
				>
					承認待ち
				</NavLink>
			</div>
			<Outlet />
		</div>
	);
}
