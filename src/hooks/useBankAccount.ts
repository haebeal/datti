import { useToast } from "@chakra-ui/react";
import useSWR from "swr";

import {
  BankAccount,
  getBankAccount,
  putBankAccount,
} from "@/features/bankAccount";
import { useAccessToken } from "@/hooks/useAccessToken";

export const useBankAccount = () => {
  const { getAccessToken } = useAccessToken();

  const toast = useToast();
  const {
    data: bankAccount,
    isLoading,
    mutate,
  } = useSWR<BankAccount>("", getBankAccount);

  const updateBankAccount = async (value: BankAccount) => {
    const accessToken = await getAccessToken();

    try {
      const result = await putBankAccount(accessToken, value);
      toast({
        title: "プロフィールを更新しました",
        status: "success",
      });
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
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
      mutate();
    }
  };

  return { isLoading, bankAccount, updateBankAccount };
};
