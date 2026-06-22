import {
	ArrowLeftRight,
	Bell,
	Check,
	ChevronRight,
	Mail,
	Receipt,
	Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { DattiMark } from "@/components/ui/datti-mark";
import { Panel, PanelHead } from "@/components/ui/panel";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* 注意: 通知/表示・テーマ/ヘルプはバックエンド未対応のデモ (ローカル state のみ)。 */

function NotifRow({
	icon,
	label,
	sub,
	checked,
	onCheckedChange,
	last,
}: {
	icon: ReactNode;
	label: string;
	sub?: string;
	checked: boolean;
	onCheckedChange: (v: boolean) => void;
	last?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 px-6 py-4",
				!last && "border-b border-hair",
			)}
		>
			<span className="flex text-ink-2">{icon}</span>
			<div className="flex-1">
				<div className="text-sm text-ink">{label}</div>
				{sub && (
					<div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
				)}
			</div>
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}

export function NotificationsPanel() {
	const [s, setS] = useState({
		added: true,
		repaid: true,
		reminder: false,
		invite: true,
		email: false,
	});
	const tg = (k: keyof typeof s) => (v: boolean) =>
		setS((p) => ({ ...p, [k]: v }));
	const ic = "size-[19px]";
	return (
		<div className="flex flex-col gap-5">
			<Panel>
				<PanelHead>プッシュ通知</PanelHead>
				<NotifRow
					icon={<Receipt className={ic} />}
					label="立て替えが追加されたとき"
					checked={s.added}
					onCheckedChange={tg("added")}
				/>
				<NotifRow
					icon={<ArrowLeftRight className={ic} />}
					label="返済を受け取ったとき"
					checked={s.repaid}
					onCheckedChange={tg("repaid")}
				/>
				<NotifRow
					icon={<Bell className={ic} />}
					label="返済のリマインダー"
					sub="未返済が残っているとき週1回"
					checked={s.reminder}
					onCheckedChange={tg("reminder")}
				/>
				<NotifRow
					icon={<Users className={ic} />}
					label="グループに招待されたとき"
					checked={s.invite}
					onCheckedChange={tg("invite")}
					last
				/>
			</Panel>
			<Panel>
				<PanelHead>メール</PanelHead>
				<NotifRow
					icon={<Mail className={ic} />}
					label="重要なお知らせをメールで受け取る"
					checked={s.email}
					onCheckedChange={tg("email")}
					last
				/>
			</Panel>
		</div>
	);
}

function SelectRow({
	label,
	selected,
	onClick,
	last,
}: {
	label: string;
	selected: boolean;
	onClick: () => void;
	last?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-center px-6 py-4 text-left",
				!last && "border-b border-hair",
			)}
		>
			<span className="flex-1 text-sm text-ink">{label}</span>
			{selected && <Check className="size-[18px] text-key" />}
		</button>
	);
}

export function DisplayPanel() {
	const [theme, setTheme] = useState("system");
	const [size, setSize] = useState("標準");
	const themes: [string, string][] = [
		["system", "端末の設定に合わせる"],
		["light", "ライト"],
		["dark", "ダーク"],
	];
	const sizes = ["小さめ", "標準", "大きめ"];
	return (
		<div className="flex flex-col gap-5">
			<Panel>
				<PanelHead>テーマ</PanelHead>
				{themes.map(([id, label], i) => (
					<SelectRow
						key={id}
						label={label}
						selected={theme === id}
						onClick={() => setTheme(id)}
						last={i === themes.length - 1}
					/>
				))}
			</Panel>
			<Panel>
				<PanelHead>文字サイズ</PanelHead>
				{sizes.map((label, i) => (
					<SelectRow
						key={label}
						label={label}
						selected={size === label}
						onClick={() => setSize(label)}
						last={i === sizes.length - 1}
					/>
				))}
			</Panel>
			<Panel>
				<PanelHead>言語</PanelHead>
				<div className="flex items-center px-6 py-4">
					<span className="flex-1 text-sm text-ink">言語</span>
					<span className="text-sm text-muted-foreground">日本語</span>
				</div>
			</Panel>
		</div>
	);
}

export function HelpPanel() {
	const faqs: [string, string][] = [
		[
			"立て替えと割り勘の違いは？",
			"立て替えは誰かが先に支払った金額、割り勘はそれを誰で分けるかの設定です。",
		],
		[
			"返済はどう記録するの？",
			"ホームか相手の「返す」を選び、金額を入力すると記録されます。",
		],
		[
			"グループから抜けるには？",
			"残額がない状態で、グループのメンバー画面から退出できます。",
		],
	];
	const [open, setOpen] = useState(0);
	const links = ["お問い合わせ", "利用規約", "プライバシーポリシー"];
	return (
		<div className="flex flex-col gap-5">
			<Panel>
				<PanelHead>よくある質問</PanelHead>
				{faqs.map(([q, a], i) => {
					const isOpen = open === i;
					return (
						<div
							key={q}
							className={cn(i !== faqs.length - 1 && "border-b border-hair")}
						>
							<button
								type="button"
								onClick={() => setOpen(isOpen ? -1 : i)}
								className="flex w-full items-center gap-3 px-6 py-4 text-left"
							>
								<span className="flex-1 text-sm font-semibold text-ink">
									{q}
								</span>
								<ChevronRight
									className={cn(
										"size-[18px] text-muted-foreground transition-transform",
										isOpen && "rotate-90",
									)}
								/>
							</button>
							{isOpen && (
								<div className="px-6 pb-4 text-[13px] leading-relaxed text-ink-2">
									{a}
								</div>
							)}
						</div>
					);
				})}
			</Panel>
			<Panel>
				<PanelHead>サポート</PanelHead>
				{links.map((label, i) => (
					<button
						type="button"
						key={label}
						className={cn(
							"flex w-full items-center px-6 py-4 text-left",
							i !== links.length - 1 && "border-b border-hair",
						)}
					>
						<span className="flex-1 text-sm text-ink">{label}</span>
						<ChevronRight className="size-[18px] text-muted-foreground" />
					</button>
				))}
			</Panel>
			<div className="py-2 text-center text-muted-foreground">
				<DattiMark size={28} className="inline-flex text-border" />
				<div className="font-num mt-2 text-xs text-muted-foreground">
					Datti for Money — v2.4.0
				</div>
			</div>
		</div>
	);
}
