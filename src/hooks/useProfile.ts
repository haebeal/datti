import { useState } from "react";

import type { Profile, Bank } from "@/api/datti/@types";

import { createDattiClient } from "@/utils";

export const useProfile = () => {
  const [isLoading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [bank, setBank] = useState<Bank>();

  const fetchProfile = async (idToken: string) => {
    setLoading(true);
    const client = createDattiClient(idToken);
    const response = await client.me.$get();
    setProfile(response);
    setLoading(false);
  };

  const fetchBank = async (idToken: string) => {
    setLoading(true);
    const client = createDattiClient(idToken);
    const response = await client.bank.$get();
    setBank(response);
    setLoading(false);
  };

  const updateProfile = async (idToken: string, data: Profile) => {
    setLoading(true);
    const client = createDattiClient(idToken);
    const response = await client.me.$put({
      body: data,
    });
    setProfile(response);
    setLoading(false);
  };

  const updateBank = async (idToken: string, data: Bank) => {
    setLoading(true);
    const client = createDattiClient(idToken);
    const response = await client.bank.$post({
      body: data,
    });
    setBank(response);
    setLoading(false);
  };

  const deleteBank = async (idToken: string) => {
    setLoading(true);
    const client = createDattiClient(idToken);
    await client.bank.$delete();
    await fetchBank(idToken);
    setLoading(false);
  };

  return {
    isLoading,
    profile,
    bank,
    fetchProfile,
    updateProfile,
    fetchBank,
    updateBank,
    deleteBank,
  };
};
