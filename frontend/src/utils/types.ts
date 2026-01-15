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
