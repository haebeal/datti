import type { Bank } from "../types";

import { fetcher } from "@/utils";

export const getBank = (code: string): Promise<Bank> =>
  fetcher<Bank>(`https://bank.teraren.com/banks/${code}.json`, null, "GET");
