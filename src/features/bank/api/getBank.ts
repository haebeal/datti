import { fetcher } from "@/utils";

import type { Bank } from "../types";

export const getBank = (code: string): Promise<Bank> => {
  return fetcher<Bank>(
    `https://bank.teraren.com/banks/${code}.json`,
    null,
    "GET",
  );
};
