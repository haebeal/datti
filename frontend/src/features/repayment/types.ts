/**
 * Repayment feature types
 */

export type Repayment = {
  id: string;
  payerId: string;
  debtorId: string;
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
