import { fetcher } from "@/utils";

import type { BankAccount } from "../types";

export const getBankAccount = async (
  accessToken: string,
): Promise<BankAccount> => {
  return fetcher<BankAccount>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/`,
    accessToken,
    "GET",
  );
};
