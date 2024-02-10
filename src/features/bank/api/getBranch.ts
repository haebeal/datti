import type { Branch } from "../types";

import { fetcher } from "@/utils";

export const getBranch = (
  bankCode: string,
  branchCode: string,
): Promise<Branch> =>
  fetcher<Branch>(
    `https://bank.teraren.com/banks/${bankCode}/branches/${branchCode}.json`,
    null,
    "GET",
  );
