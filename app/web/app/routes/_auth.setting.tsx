import type { MetaFunction } from "@remix-run/cloudflare";
import { NavLink, Outlet } from "@remix-run/react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export const meta: MetaFunction = () => [
	{ title: "Datti | 設定" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Setting() {
	return (
		<div className="flex flex-col py-3 gap-7">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">設定</h1>
			</div>
			<Card>
				<CardHeader>
					<div className="flex flex-row border-b-2 text-md font-semibold gap-5 py-1 px-4">
						<NavLink
							className={({ isActive }) =>
								isActive ? undefined : "opacity-40"
							}
							to="/setting/profile"
						>
							プロフィール
						</NavLink>
					</div>
				</CardHeader>
				<CardContent>
					<Outlet />
				</CardContent>
			</Card>
		</div>
	);
}
