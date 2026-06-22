import type * as React from "react";

type PageHeadProps = {
	title: string;
	sub?: string;
	/** 右端のアクション (ボタン等) */
	right?: React.ReactNode;
};

/** デスクトップ画面のページ見出し (タイトル＋サブ＋右アクション)。 */
export function PageHead({ title, sub, right }: PageHeadProps) {
	return (
		<div className="mb-6 flex items-end justify-between gap-4">
			<div>
				<h1 className="font-heading text-[28px] font-extrabold tracking-[-0.02em] text-foreground">
					{title}
				</h1>
				{sub && <div className="mt-1.5 text-[13.5px] text-ink-2">{sub}</div>}
			</div>
			{right}
		</div>
	);
}
