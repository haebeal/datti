/**
 * Common utilities used across the application
 */

export { cn } from "./cn";

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
 * Formats a date for display in Japanese format (JST)
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
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
