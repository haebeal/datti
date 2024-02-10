import type { Bank } from "../types";

import { fetcher } from "@/utils";

export const getBanks = (input?: string): Promise<Bank[]> =>
  fetcher<Bank[]>(
    !input
      ? "https://bank.teraren.com/banks.json"
      : `https://bank.teraren.com/banks/search.json?name=${input}`,
    null,
    "GET",
  );
