import { fetcher } from "@/utils";

import type { Branch } from "../types";

export const getBranch = (
  bankCode: string,
  branchCode: string,
): Promise<Branch> => {
  return fetcher<Branch>(
    `https://bank.teraren.com/banks/${bankCode}/branches/${branchCode}.json`,
    null,
    "GET",
  );
};
