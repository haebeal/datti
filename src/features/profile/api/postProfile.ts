import { fetcher } from "@/utils";

import type { Profile } from "../types";

export const postProfile = (
  accessToken: string,
  body: Partial<Profile>,
): Promise<Profile> => {
  return fetcher<Profile>("/api/me", accessToken, "POST", body);
};
