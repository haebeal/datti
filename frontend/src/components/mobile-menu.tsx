import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeftRight, House, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileMenu() {
	const { pathname } = useLocation();

	const items = [
		{ to: "/", icon: House, label: "ホーム", match: pathname === "/" },
		{
			to: "/repayments",
			icon: ArrowLeftRight,
			label: "返した記録",
			match: pathname.startsWith("/repayments"),
		},
		{
			to: "/groups",
			icon: Users,
			label: "グループ",
			match: pathname.startsWith("/groups"),
		},
		{
			to: "/profile",
			icon: User,
			label: "マイページ",
			match: pathname === "/profile",
		},
	] as const;

	return (
		<nav
			className={cn(
				"sm:hidden fixed bottom-0 left-0 right-0",
				"bg-card border-t border-border z-50",
			)}
		>
			<div className="flex justify-around items-center h-16">
				{items.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className={cn(
							"flex flex-col items-center justify-center gap-1 flex-1 h-full",
							item.match
								? "text-primary font-semibold"
								: "text-muted-foreground",
						)}
					>
						<item.icon className="w-5.5 h-5.5" />
						<span className="text-[10px]">{item.label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
