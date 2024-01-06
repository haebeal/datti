import { fetcher } from "@/utils";

import type { Branch } from "../types";

export const getBranchs = (bankCode: string): Promise<Branch[]> => {
  return fetcher<Branch[]>(
    `https://bank.teraren.com/banks/${bankCode}.json`,
    null,
  );
};
