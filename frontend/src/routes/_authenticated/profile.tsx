import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import {
	Bell,
	Link2,
	Receipt,
	SunMedium,
	User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { PageHead } from "@/components/ui/page-head";
import { Panel } from "@/components/ui/panel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { creditsQueryOptions } from "@/features/credit/queries";
import { meQueryOptions } from "@/features/user/queries";
import { logout } from "@/libs/auth/actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(meQueryOptions),
			context.queryClient.ensureQueryData(creditsQueryOptions()),
		]),
	component: ProfileLayout,
});

const SECTIONS = [
	{ to: "/profile/account", label: "アカウント設定", icon: UserIcon },
	{ to: "/profile/connect", label: "アカウント連携", icon: Link2 },
	{ to: "/profile/notifications", label: "通知", icon: Bell },
	{ to: "/profile/display", label: "表示・テーマ", icon: SunMedium },
	{ to: "/profile/help", label: "ヘルプ", icon: Receipt },
] as const;

function ProfileLayout() {
	const { pathname } = useLocation();
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const { data: credits } = useSuspenseQuery(creditsQueryOptions());

	const totalLent = credits
		.filter((c) => c.amount > 0)
		.reduce((s, c) => s + c.amount, 0);
	const totalBorrowed = credits
		.filter((c) => c.amount < 0)
		.reduce((s, c) => s + Math.abs(c.amount), 0);

	return (
		<div>
			<PageHead title="マイページ" sub="プロフィールとアプリの設定" />

			<div className="grid grid-cols-1 items-start gap-[22px] md:grid-cols-[300px_1fr]">
				{/* 左: プロフィールカード＋セクションナビ＋ログアウト */}
				<div className="flex flex-col gap-[22px]">
					<Panel className="p-[22px] text-center">
						<UserAvatar user={me} className="mx-auto size-[76px] text-2xl" />
						<div className="mt-3 font-heading text-lg font-extrabold text-foreground">
							{me.name}
						</div>
						<div className="font-num mt-1 text-[12.5px] text-muted-foreground">
							{me.email}
						</div>
						<div className="mt-[18px] flex overflow-hidden rounded-xl border border-border">
							<div className="flex-1 px-2 py-3">
								<div className="mb-1.5 text-[11px] text-ink-2">返してもらう</div>
								<Money value={totalLent} colored className="text-[15px]" />
							</div>
							<div className="w-px bg-hair" />
							<div className="flex-1 px-2 py-3">
								<div className="mb-1.5 text-[11px] text-ink-2">返す</div>
								<Money value={-totalBorrowed} colored className="text-[15px]" />
							</div>
						</div>
					</Panel>

					<Panel className="flex flex-col gap-0.5 p-1.5">
						{SECTIONS.map((s) => {
							const on = pathname === s.to;
							return (
								<Link
									key={s.to}
									to={s.to}
									className={cn(
										"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
										on
											? "bg-accent font-bold text-key"
											: "font-semibold text-ink-2 hover:bg-secondary",
									)}
								>
									<s.icon className="size-[19px]" />
									{s.label}
								</Link>
							);
						})}
					</Panel>

					<Button
						variant="destructive"
						size="lg"
						onClick={() => logout()}
						className="w-full"
					>
						ログアウト
					</Button>
				</div>

				{/* 右: 選択セクション (子ルート) */}
				<div>
					<Outlet />
				</div>
			</div>
		</div>
	);
}
