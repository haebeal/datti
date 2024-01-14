import { fetcher } from "@/utils";

import type { Profile } from "../types";

export const putProfile = async (
  accessToken: string,
  body: Partial<Profile>,
): Promise<Profile> => {
  return fetcher<Profile>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`,
    accessToken,
    "PUT",
    body,
  );
};
