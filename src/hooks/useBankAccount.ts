import axiosClient from "@aspida/axios";
import useAspidaSWR from "@aspida/swr";
import { useToast } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useState } from "react";

import type { BankAccount } from "@/api/@types";

import { useFirebase } from "@/hooks";

import api from "@/api/$api";

export const useBankAccount = () => {
  const { idToken } = useFirebase();
  const [isUpdating, setUpdating] = useState(false);

  const client = api(
    axiosClient(undefined, {
      baseURL: "https://datti-api-dev.fly.dev",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }),
  );
  const toast = useToast();

  const {
    data: bankAccount,
    isLoading: isFetching,
    isValidating,
    mutate,
  } = useAspidaSWR(client.bank, {
    enabled: idToken ? true : false,
    onErrorRetry: (error: AxiosError) => {
      if (error.response?.status === 404) return;
    },
  });

  const reloadBankAccount = async () => {
    await mutate();
  };

  const updateBankAccount = async (value: BankAccount) => {
    try {
      setUpdating(true);
      await client.bank.$post({
        body: value,
      });
      toast({
        title: "口座情報を更新しました",
        status: "success",
      });
      await mutate();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast({
          status: "error",
          title: error.message,
        });
      } else {
        toast({
          status: "error",
          title: "不明なエラーが発生しました",
        });
      }
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const deleteBankAccount = async () => {
    try {
      setUpdating(true);
      await client.bank.$delete();
      toast({
        title: "口座情報を削除しました",
        status: "info",
      });
      await mutate();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast({
          status: "error",
          title: error.message,
        });
      } else {
        toast({
          status: "error",
          title: "不明なエラーが発生しました",
        });
      }
      return null;
    } finally {
      setUpdating(false);
    }
  };

  return {
    isLoading: isFetching || isUpdating || isValidating,
    bankAccount,
    updateBankAccount,
    deleteBankAccount,
    reloadBankAccount,
  };
};
