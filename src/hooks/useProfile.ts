import { useToast } from "@chakra-ui/react";
import useSWR from "swr";

import { Profile, getProfile, updateProfile } from "@/features/profile";
import { useSession } from "next-auth/react";

export const useProfile = () => {
  const { data: session, status } = useSession();
  const toast = useToast();

  const {
    data: profile,
    isLoading: isFetching,
    mutate,
  } = useSWR<Profile>(session?.credential.accessToken, getProfile);

  const update = async (value: Partial<Profile>) => {
    if (!profile || !session?.credential.accessToken) {
      return;
    }
    updateProfile(session.credential.accessToken, value);
    toast({
      title: "プロフィールを更新しました",
      status: "success",
    });
    mutate({ ...profile, ...value });
  };

  const isLoading = status === "loading" || isFetching;

  return { profile, isLoading, update };
};
