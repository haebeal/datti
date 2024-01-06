import { fetcher } from "@/utils";

import type { Profile } from "../types";

export const getProfile = (accessToken: string): Promise<Profile> => {
  return fetcher<Profile>(`${process.env.NEXTAUTH_URL}/api/me`, accessToken);
};
