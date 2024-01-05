import { fetcher } from "@/utils";

import { Profile } from "../types";

export const getProfile = (accessToken: string): Promise<Profile> => {
  return fetcher<Profile>("/api/me", accessToken);
};
