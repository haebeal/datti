import { useState } from "react";

import type { Profile } from "@/api/@types";

import { createClient } from "@/utils";

export const useProfile = () => {
  const [isLoading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();

  const fetchProfile = async (idToken: string) => {
    setLoading(true);
    const client = createClient(idToken);
    const response = await client.me.$get();
    setProfile(response);
    setLoading(false);
  };

  const updateProfile = async (idToken: string, data: Profile) => {
    setLoading(true);
    const client = createClient(idToken);
    const response = await client.me.$put({
      body: data,
    });
    setProfile(response);
    setLoading(false);
  };

  return { isLoading, profile, fetchProfile, updateProfile };
};
