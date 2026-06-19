import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** アバター表示に必要な最小限のユーザー情報 */
export type AvatarUser = {
	id?: string;
	name: string;
	avatar?: string | null;
};

const AVATAR_COLORS = [
	"#2563eb",
	"#db2777",
	"#7c3aed",
	"#d97706",
	"#0891b2",
	"#059669",
	"#1c857e",
	"#0017c1",
	"#b25000",
	"#6b2fb3",
];

/** id / 名前から決定的に背景色を選ぶ (画像が無いときのフォールバック用) */
function pickColor(seed: string): string {
	let h = 0;
	for (let i = 0; i < seed.length; i++) {
		h = (h * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

type UserAvatarProps = {
	user: AvatarUser;
	/** 白フチ (重なり表示などで使用) */
	ring?: boolean;
	className?: string;
};

/**
 * ユーザーアバター。avatar 画像があれば表示し、無ければ
 * 名前の頭文字＋決定的な背景色のフォールバックを表示する。
 * サイズは className (size-*, text-*) で指定する。
 */
export function UserAvatar({ user, ring, className }: UserAvatarProps) {
	const color = pickColor(user.id ?? user.name);
	const initial = user.name?.charAt(0) ?? "?";
	return (
		<Avatar
			className={cn("size-10", ring && "ring-2 ring-background", className)}
		>
			{user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
			<AvatarFallback
				className="font-heading font-semibold text-white"
				style={{ background: color }}
			>
				{initial}
			</AvatarFallback>
		</Avatar>
	);
}

type AvatarStackProps = {
	users: AvatarUser[];
	max?: number;
	className?: string;
};

/** 重なり表示のアバター群。max を超えたぶんは「+N」で省略表示。 */
export function AvatarStack({ users, max = 4, className }: AvatarStackProps) {
	const shown = users.slice(0, max);
	const extra = users.length - shown.length;
	return (
		<div className={cn("flex items-center -space-x-2", className)}>
			{shown.map((u) => (
				<UserAvatar
					key={u.id ?? u.name}
					user={u}
					ring
					className="size-6 text-xs"
				/>
			))}
			{extra > 0 && (
				<div className="font-num flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-background">
					+{extra}
				</div>
			)}
		</div>
	);
}
