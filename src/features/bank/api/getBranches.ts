import { fetcher } from "@/utils";

import type { Branch } from "../types";

export const getBranches = (
  bankCode: string,
  input?: string,
): Promise<Branch[]> => {
  return fetcher<Branch[]>(
    !input
      ? `https://bank.teraren.com/banks/${bankCode}/branches.json`
      : `https://bank.teraren.com/banks/${bankCode}/branches/search.json?name=${input}`,
    null,
  );
};
