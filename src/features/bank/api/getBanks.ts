import { fetcher } from "@/utils";

import type { Bank } from "../types";

export const getBanks = (): Promise<Bank[]> => {
  return fetcher<Bank[]>("https://bank.teraren.com/banks.json", null);
};
