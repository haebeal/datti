import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftRight, House, Plus, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DattiMark } from "@/components/ui/datti-mark";
import { UserAvatar } from "@/components/ui/user-avatar";
import { authUserQueryOptions } from "@/libs/auth/queries";
import { cn } from "@/lib/utils";

const NAV = [
	{ to: "/", icon: House, label: "ホーム", match: (p: string) => p === "/" },
	{
		to: "/groups",
		icon: Users,
		label: "グループ",
		match: (p: string) => p.startsWith("/groups"),
	},
	{
		to: "/repayments",
		icon: ArrowLeftRight,
		label: "返した記録",
		match: (p: string) => p.startsWith("/repayments"),
	},
	{
		to: "/profile",
		icon: User,
		label: "マイページ",
		match: (p: string) => p.startsWith("/profile"),
	},
] as const;

export function Sidebar() {
	const { data: user } = useQuery(authUserQueryOptions);
	const { pathname } = useLocation();

	return (
		<aside className="hidden h-full w-[252px] shrink-0 flex-col border-r border-border bg-card px-4 pt-5 pb-4 sm:flex">
			<Link to="/" className="flex items-center gap-2.5 px-2 pb-5">
				<DattiMark size={26} className="text-primary" />
				<span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
					Datti
				</span>
			</Link>

			<Button asChild size="lg" className="mb-4 w-full justify-center">
				<Link to="/groups">
					<Plus className="size-[18px]" /> 立て替えを追加
				</Link>
			</Button>

			<nav className="flex flex-col gap-0.5">
				{NAV.map((item) => {
					const active = item.match(pathname);
					return (
						<Link
							key={item.to}
							to={item.to}
							className={cn(
								"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
								active
									? "bg-accent font-bold text-primary"
									: "font-semibold text-ink-2 hover:bg-secondary",
							)}
						>
							<item.icon className="size-5" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="flex-1" />

			{user && (
				<Link
					to="/profile"
					className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-secondary"
				>
					<UserAvatar
						user={{ name: user.name, avatar: user.picture }}
						className="size-9"
					/>
					<div className="min-w-0">
						<p className="truncate font-heading text-[13.5px] font-bold text-foreground">
							{user.name}
						</p>
						<p className="font-num truncate text-[11px] text-muted-foreground">
							{user.email}
						</p>
					</div>
				</Link>
			)}
		</aside>
	);
}
