import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Bell,
	Link2,
	Receipt,
	SunMedium,
	User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { PageHead } from "@/components/ui/page-head";
import { Panel } from "@/components/ui/panel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { creditsQueryOptions } from "@/features/credit/queries";
import { AccountConnectPanel } from "@/features/user/components/account-connect-panel";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import {
	DisplayPanel,
	HelpPanel,
	NotificationsPanel,
} from "@/features/user/components/settings-sections";
import { meQueryOptions } from "@/features/user/queries";
import { cn } from "@/lib/utils";
import { logout } from "@/libs/auth/actions";

export const Route = createFileRoute("/_authenticated/profile")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(meQueryOptions),
			context.queryClient.ensureQueryData(creditsQueryOptions()),
		]),
	component: ProfilePage,
});

type SectionId = "account" | "connect" | "notifications" | "display" | "help";

const SECTIONS = [
	{ id: "account", label: "アカウント設定", icon: UserIcon },
	{ id: "connect", label: "アカウント連携", icon: Link2 },
	{ id: "notifications", label: "通知", icon: Bell },
	{ id: "display", label: "表示・テーマ", icon: SunMedium },
	{ id: "help", label: "ヘルプ", icon: Receipt },
] as const satisfies ReadonlyArray<{
	id: SectionId;
	label: string;
	icon: typeof UserIcon;
}>;

function ProfilePage() {
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const { data: credits } = useSuspenseQuery(creditsQueryOptions());
	const [section, setSection] = useState<SectionId>("account");

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
								<div className="mb-1.5 text-[11px] text-ink-2">
									返してもらう
								</div>
								<Money value={totalLent} colored className="text-[15px]" />
							</div>
							<div className="w-px bg-hair" />
							<div className="flex-1 px-2 py-3">
								<div className="mb-1.5 text-[11px] text-ink-2">返す</div>
								<Money value={-totalBorrowed} colored className="text-[15px]" />
							</div>
						</div>
					</Panel>

					<Panel className="p-1.5">
						{SECTIONS.map((s) => {
							const on = s.id === section;
							return (
								<button
									type="button"
									key={s.id}
									onClick={() => setSection(s.id)}
									className={cn(
										"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
										on
											? "bg-accent font-bold text-key"
											: "font-semibold text-ink-2 hover:bg-secondary",
									)}
								>
									<s.icon className="size-[19px]" />
									{s.label}
								</button>
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

				{/* 右: 選択セクション */}
				<div>
					{section === "account" && (
						<Panel className="p-6">
							<h2 className="mb-5 font-heading text-[17px] font-bold text-foreground">
								アカウント設定
							</h2>
							<ProfileEditForm user={me} />
						</Panel>
					)}
					{section === "connect" && <AccountConnectPanel user={me} />}
					{section === "notifications" && <NotificationsPanel />}
					{section === "display" && <DisplayPanel />}
					{section === "help" && <HelpPanel />}
				</div>
			</div>
		</div>
	);
}
