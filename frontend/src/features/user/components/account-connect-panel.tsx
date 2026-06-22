import { Check, Info } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Panel, PanelHead } from "@/components/ui/panel";
import { useUnlinkLine } from "@/features/user/mutations";
import type { User } from "@/features/user/types";
import { cn } from "@/lib/utils";

const GoogleIcon = (
	<svg
		width="28"
		height="28"
		viewBox="0 0 28 28"
		fill="none"
		aria-hidden="true"
	>
		<rect width="28" height="28" rx="7" fill="#f8f8f8" stroke="#e8e8ea" />
		<path
			d="M21.6 14.18c0-.56-.05-1.1-.14-1.62H14v3.07h4.27a3.65 3.65 0 0 1-1.58 2.39v1.99h2.55c1.5-1.38 2.36-3.41 2.36-5.83Z"
			fill="#4285F4"
		/>
		<path
			d="M14 22c2.15 0 3.95-.71 5.26-1.93l-2.55-1.98c-.71.48-1.62.76-2.71.76-2.08 0-3.85-1.41-4.48-3.3H6.9v2.05A7.98 7.98 0 0 0 14 22Z"
			fill="#34A853"
		/>
		<path
			d="M9.52 15.55a4.8 4.8 0 0 1 0-3.08V10.4H6.9a8 8 0 0 0 0 7.18l2.62-2.03Z"
			fill="#FBBC05"
		/>
		<path
			d="M14 9.18c1.17 0 2.22.4 3.05 1.19l2.28-2.28A8 8 0 0 0 6.9 10.42l2.62 2.05C10.15 10.58 11.91 9.18 14 9.18Z"
			fill="#EA4335"
		/>
	</svg>
);

const LineIcon = (
	<svg
		width="28"
		height="28"
		viewBox="0 0 28 28"
		fill="none"
		aria-hidden="true"
	>
		<rect width="28" height="28" rx="7" fill="#06C755" />
		<path
			d="M22 13.18C22 9.58 18.42 6.67 14 6.67S6 9.58 6 13.18c0 3.2 2.84 5.88 6.67 6.39.26.06.61.17.7.4.08.2.05.52.03.72l-.11.68c-.04.2-.15.78.68.43.84-.36 4.5-2.65 6.14-4.54A5.63 5.63 0 0 0 22 13.18Z"
			fill="white"
		/>
		<path
			d="M11.73 15.1H10.1a.32.32 0 0 1-.32-.32v-3.4c0-.18.14-.32.32-.32s.32.14.32.32v3.08h1.31c.18 0 .32.14.32.32s-.14.32-.32.32ZM12.65 14.78v-3.4c0-.18.14-.32.32-.32s.32.14.32.32v3.4c0 .18-.14.32-.32.32s-.32-.14-.32-.32ZM17.28 14.78c0 .14-.09.27-.22.31a.3.3 0 0 1-.1.01.32.32 0 0 1-.25-.12l-1.74-2.37v2.17c0 .18-.14.32-.32.32s-.32-.14-.32-.32v-3.4c0-.14.09-.27.22-.31a.3.3 0 0 1 .1-.01c.1 0 .19.04.25.12l1.74 2.37v-2.17c0-.18.14-.32.32-.32s.32.14.32.32v3.4ZM19.54 12.7c.18 0 .32.14.32.32s-.14.32-.32.32h-1.31v.74h1.31c.18 0 .32.14.32.32s-.14.32-.32.32h-1.63a.32.32 0 0 1-.32-.32v-3.4c0-.18.14-.32.32-.32h1.63c.18 0 .32.14.32.32s-.14.32-.32.32h-1.31v.38h1.31Z"
			fill="#06C755"
		/>
	</svg>
);

function ConnectedBadge({ color }: { color: string }) {
	return (
		<span
			className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
			style={{ color }}
		>
			<Check className="size-3.5" /> 連携済み
		</span>
	);
}

function ServiceRow({
	icon,
	name,
	desc,
	action,
	last,
}: {
	icon: ReactNode;
	name: string;
	desc: string;
	action: ReactNode;
	last?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 px-6 py-[18px]",
				!last && "border-b border-hair",
			)}
		>
			<div className="shrink-0">{icon}</div>
			<div className="min-w-0 flex-1">
				<div className="text-sm font-bold text-ink">{name}</div>
				<div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
			</div>
			{action}
		</div>
	);
}

/** アカウント連携パネル。Google はログイン手段(連携済み固定)、LINE は解除可能。 */
export function AccountConnectPanel({ user }: { user: User }) {
	const unlinkLine = useUnlinkLine();
	const lineConnected = !!user.lineUserId;

	return (
		<div className="flex flex-col gap-5">
			<Panel>
				<PanelHead>連携サービス</PanelHead>

				<ServiceRow
					icon={GoogleIcon}
					name="Google"
					desc="Googleアカウントでログインできます"
					action={<ConnectedBadge color="#4285F4" />}
				/>

				<ServiceRow
					last
					icon={LineIcon}
					name="LINE"
					desc="LINEで友達を招待・返済通知を受け取る"
					action={
						lineConnected ? (
							<div className="flex shrink-0 items-center gap-3">
								<ConnectedBadge color="#06C755" />
								<Button
									variant="outline"
									size="sm"
									disabled={unlinkLine.isPending}
									onClick={() => unlinkLine.mutate()}
								>
									{unlinkLine.isPending ? "解除中…" : "解除する"}
								</Button>
							</div>
						) : (
							<Button
								size="sm"
								disabled
								title="LINE連携は準備中です"
								className="shrink-0 bg-[#06C755] text-white"
							>
								連携する
							</Button>
						)
					}
				/>
			</Panel>

			<Panel className="px-6 py-5">
				<div className="flex items-start gap-3">
					<Info className="mt-0.5 size-[18px] shrink-0 text-muted-foreground" />
					<p className="text-[13px] leading-relaxed text-muted-foreground">
						連携したサービスで Datti
						にサインインできるようになります。連携を解除しても Datti
						アカウントとデータは保持されます。
					</p>
				</div>
			</Panel>
		</div>
	);
}
