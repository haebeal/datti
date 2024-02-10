import type { Branch } from "../types";

import { fetcher } from "@/utils";

export const getBranches = (
  bankCode: string,
  input?: string,
): Promise<Branch[]> =>
  fetcher<Branch[]>(
    !input
      ? `https://bank.teraren.com/banks/${bankCode}/branches.json`
      : `https://bank.teraren.com/banks/${bankCode}/branches/search.json?name=${input}`,
    null,
  );
