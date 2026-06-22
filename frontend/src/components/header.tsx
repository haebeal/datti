import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type PageConfig = {
	title: string;
	back?: string;
	bell?: boolean;
};

function getPageConfig(pathname: string): PageConfig {
	if (pathname === "/") return { title: "ホーム" };
	if (pathname === "/repayments") return { title: "返した記録" };
	if (pathname === "/repayments/new")
		return { title: "返した記録をつける", back: "/repayments" };
	if (pathname.startsWith("/repayments/"))
		return { title: "返した記録", back: "/repayments" };
	if (pathname === "/groups") return { title: "グループ" };
	if (pathname === "/groups/new")
		return { title: "グループをつくる", back: "/groups" };
	if (pathname.endsWith("/lendings/new")) {
		const groupPath = pathname.replace("/lendings/new", "/lendings");
		return { title: "立て替えを追加", back: groupPath };
	}
	if (pathname.endsWith("/settings")) {
		const groupPath = pathname.replace("/settings", "/lendings");
		return { title: "グループ設定", back: groupPath, bell: true };
	}
	if (pathname === "/profile") return { title: "マイページ" };
	return { title: "ホーム" };
}

export function Header() {
	const { pathname } = useLocation();
	const config = getPageConfig(pathname);

	const isGroupDetail = /^\/groups\/[^/]+\/lendings$/.test(pathname);
	if (isGroupDetail) return null;

	if (config.back) {
		return (
			<header
				className={cn("sm:hidden", "flex items-center gap-2", "h-16 px-4")}
			>
				<Link to={config.back} className="p-1 -ml-1" aria-label="戻る">
					<ArrowLeft className="w-6 h-6 text-primary-base" />
				</Link>
				<span className="text-2xl font-bold text-primary-base">
					{config.title}
				</span>
				{config.bell && (
					<>
						<div className="flex-1" />
						<button
							type="button"
							className="p-2 -mr-2 cursor-pointer"
							aria-label="通知"
						>
							<Bell className="w-6 h-6 text-primary-base" />
						</button>
					</>
				)}
			</header>
		);
	}

	return (
		<header
			className={cn(
				"sm:hidden",
				"flex items-center justify-between",
				"h-16 px-4",
			)}
		>
			<span className="text-2xl font-bold text-primary-base">
				{config.title}
			</span>
			<button
				type="button"
				className="p-2 -mr-2 cursor-pointer"
				aria-label="通知"
			>
				<Bell className="w-6 h-6 text-primary-base" />
			</button>
		</header>
	);
}
