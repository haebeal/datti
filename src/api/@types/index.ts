/* eslint-disable */
export type RequestBankAccount = {
  accountCode: string;
  bankCode: string;
  branchCode: string;
};

export type BankAccount = {
  uid?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  deletedAt?: string | undefined;
  accountCode: string;
  bankCode: string;
  branchCode: string;
};
