/**
 * Repayment feature types
 */

import type { User } from "@/features/user/types";

/**
 * Backend API response type (single repayment)
 */
export type RepaymentResponse = {
  id: string;
  payerId: string;
  debtorId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * Backend API response type (paginated list)
 */
export type PaginatedRepaymentResponse = {
  repayments: RepaymentResponse[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Frontend Repayment type with user information
 */
export type Repayment = {
  id: string;
  payer: User;
  debtor: User;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateRepaymentRequest = {
  debtorId: string;
  amount: number;
};

export type UpdateRepaymentRequest = {
  amount: number;
};
