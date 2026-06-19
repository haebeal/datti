/**
 * TanStack Form の field.state.meta.errors を表示用の文字列にまとめる。
 * 文字列エラー・Zod の { message } 形式の両方に対応する。
 */
export function getFieldErrorMessage(
	errors: ReadonlyArray<unknown>,
): string | undefined {
	if (errors.length === 0) return undefined;
	return (
		errors
			.map((err) =>
				typeof err === "string"
					? err
					: typeof err === "object" && err && "message" in err
						? String((err as { message: unknown }).message)
						: undefined,
			)
			.filter(Boolean)
			.join(", ") || undefined
	);
}
