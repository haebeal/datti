/**
 * Common schemas and types used across the application
 */

/**
 * Generic Result type for server actions
 * Represents either a successful result or an error
 */
export type Result<T> =
	| {
			success: true;
			result: T;
			error: null;
	  }
	| {
			success: false;
			result: null;
			error: string;
	  };

/**
 * Converts a Date object to ISO date string (YYYY-MM-DD)
 */
export const dateToString = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

/**
 * Converts an ISO date string to a Date object
 */
export const stringToDate = (dateString: string): Date => {
	return new Date(dateString);
};

/**
 * Formats a date for display in Japanese format
 */
export const formatDate = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(d);
};

/**
 * Formats currency amount in Japanese Yen
 */
export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("ja-JP", {
		style: "currency",
		currency: "JPY",
	}).format(amount);
};
