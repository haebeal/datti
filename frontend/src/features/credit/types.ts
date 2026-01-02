/**
 * Credit feature types
 */

import type { User } from "@/features/user/types";

/**
 * Backend API response type
 */
export type CreditResponse = {
  userId: string;
  amount: number;
};

/**
 * Frontend Credit type with user information
 */
export type Credit = {
  user: User;
  amount: number;
};
