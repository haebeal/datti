import useSWR from "swr";

import { Profile, getProfile } from "@/features/profile";
import { useSession } from "next-auth/react";

export const useProfile = () => {
  const { data: session } = useSession();

  const { data: profile } = useSWR<Profile>(
    session?.credential.accessToken,
    getProfile,
  );

  return { profile };
};
