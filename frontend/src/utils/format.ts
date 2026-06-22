export const formatDate = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "Asia/Tokyo",
	}).format(d);
};

export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("ja-JP", {
		style: "currency",
		currency: "JPY",
	}).format(amount);
};

/** "¥1,234" — 符号なし・絶対値の円表記 */
export const yen = (n: number): string =>
	`¥${Math.abs(Math.round(n)).toLocaleString("ja-JP")}`;

/** "+¥1,234" / "−¥1,234" — 符号つきの円表記 (マイナスは U+2212) */
export const signedYen = (n: number): string =>
	`${n > 0 ? "+" : n < 0 ? "−" : ""}${yen(n)}`;

/** "5月30日" — 月日のみの短い表記 (JST) */
export const formatMonthDay = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("ja-JP", {
		month: "long",
		day: "numeric",
		timeZone: "Asia/Tokyo",
	}).format(d);
};
