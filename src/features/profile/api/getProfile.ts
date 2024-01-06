import { fetcher } from "@/utils";

import type { Profile } from "../types";

export const getProfile = async (accessToken: string) => {
  const data = await fetcher<Profile>(
    `${process.env.NEXTAUTH_URL}/api/me`,
    accessToken,
  );
  console.log(data);
  return data;
};
