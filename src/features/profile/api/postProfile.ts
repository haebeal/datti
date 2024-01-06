import { fetcher } from "@/utils";

import type { Profile } from "../types";

export const postProfile = (
  accessToken: string,
  body: Partial<Profile>,
): Promise<Profile> => {
  console.log(body);
  return fetcher<Profile>(
    `${process.env.NEXTAUTH_URL}/api/me`,
    accessToken,
    "POST",
  );
};
