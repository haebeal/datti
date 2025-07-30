import type { MetaFunction } from "react-router";
import { Outlet } from "react-router";

export const meta: MetaFunction = () => [
	{ title: "Datti | 設定" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Setting() {
	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col md:flex-row gap-5 justify-between md:py-5 px-3">
				<h1 className="text-std-32N-150">設定</h1>
			</div>
			<Outlet />
		</div>
	);
}
