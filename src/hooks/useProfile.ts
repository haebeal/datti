import useSWR from "swr";

import { Profile, getProfile } from "@/features/profile";
import { useSession } from "next-auth/react";

export const useProfile = () => {
  const { data: session, status } = useSession();

  const { data: profile, isLoading: isFetching } = useSWR<Profile>(
    session?.credential.accessToken,
    getProfile,
  );

  const isLoading = status === "loading" || isFetching;

  return { profile, isLoading };
};
