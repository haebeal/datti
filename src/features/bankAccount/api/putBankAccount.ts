import { fetcher } from "@/utils";

import type { BankAccount } from "../types";

export const putBankAccount = async (
  accessToken: string,
  body: BankAccount,
): Promise<BankAccount> => {
  return fetcher<BankAccount>(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/`,
    accessToken,
    "PUT",
    body,
  );
};
