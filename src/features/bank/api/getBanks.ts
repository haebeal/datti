import { fetcher } from "@/utils";

import type { Bank } from "../types";

export const getBanks = (input?: string): Promise<Bank[]> => {
  return fetcher<Bank[]>(
    !input
      ? "https://bank.teraren.com/banks.json"
      : `https://bank.teraren.com/banks/search.json?name=${input}`,
    null,
    "GET",
  );
};
