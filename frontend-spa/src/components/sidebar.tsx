import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftRight, House, Plus, Settings } from "lucide-react";
import { authUserQueryOptions } from "@/libs/auth/queries";
import { cn } from "@/utils/cn";

export function Sidebar() {
	const { data: user } = useQuery(authUserQueryOptions);
	const { pathname } = useLocation();

	const isActive = (path: string) => {
		if (path === "/") return pathname === "/";
		if (path === "/repayments") return pathname.startsWith("/repayments");
		return false;
	};

	return (
		<aside
			className={cn(
				"h-full w-80",
				"hidden",
				"sm:flex flex-col",
				"px-4 py-6",
				"bg-white",
				"border-gray-200 border-r",
			)}
		>
			<Link
				to="/"
				className={cn("flex items-center gap-1", "px-2 py-2 pb-6")}
			>
				<img src="/logo.svg" alt="Datti" className="w-7 h-7 shrink-0" />
				<span className="text-2xl font-bold text-primary-base">atti</span>
			</Link>

			<div className={cn("flex flex-col gap-1")}>
				<p className={cn("px-2 pb-1", "text-xs font-semibold text-gray-400")}>
					マイページ
				</p>
				<nav className={cn("flex flex-col gap-1")}>
					<Link
						to="/"
						className={cn(
							"flex items-center gap-3",
							"px-4 py-2.5 rounded-lg",
							"transition-colors",
							isActive("/")
								? "bg-primary-surface text-primary-base font-semibold"
								: "text-gray-500 hover:bg-gray-50",
						)}
					>
						<House className="w-5 h-5" />
						<span className="text-sm">ホーム</span>
					</Link>

					<Link
						to="/repayments"
						className={cn(
							"flex items-center gap-3",
							"px-4 py-2.5 rounded-lg",
							"transition-colors",
							isActive("/repayments")
								? "bg-primary-surface text-primary-base font-semibold"
								: "text-gray-500 hover:bg-gray-50",
						)}
					>
						<ArrowLeftRight className="w-5 h-5" />
						<span className="text-sm">返した記録</span>
					</Link>
				</nav>
			</div>

			<div className={cn("flex flex-col gap-1", "pt-4")}>
				<div
					className={cn("flex items-center justify-between", "px-2 pb-1")}
				>
					<span className="text-xs font-semibold text-gray-400">グループ</span>
					<Link
						to="/groups/new"
						className={cn(
							"p-0.5 rounded",
							"hover:bg-gray-100 transition-colors",
						)}
						aria-label="グループを追加"
					>
						<Plus className="w-4 h-4 text-gray-400" />
					</Link>
				</div>
			</div>

			<div className="flex-1" />

			{user && (
				<div
					className={cn(
						"flex items-center gap-3",
						"px-2 py-4",
						"border-t border-gray-200",
					)}
				>
					{user.picture ? (
						<img
							src={user.picture}
							alt={user.name}
							className="w-10 h-10 rounded-full object-cover"
						/>
					) : (
						<div
							className={cn(
								"w-10 h-10 rounded-full",
								"bg-accent-base",
								"flex items-center justify-center",
								"text-white font-bold text-sm",
							)}
						>
							{user.name.charAt(0)}
						</div>
					)}
					<div className="flex flex-col flex-1 min-w-0">
						<p
							className={cn(
								"text-sm font-semibold text-primary-base truncate",
							)}
						>
							{user.name}
						</p>
						<p className="text-xs text-gray-500 truncate">{user.email}</p>
					</div>
					<Link
						to="/profile"
						className={cn(
							"p-2 rounded-md",
							"transition-colors",
							"hover:bg-gray-100",
							"flex items-center justify-center",
						)}
					>
						<Settings className="w-5 h-5 text-gray-400" />
					</Link>
				</div>
			)}
		</aside>
	);
}
