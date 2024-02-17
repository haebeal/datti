import { Button, Flex, Spacer, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { Bank as BankData, Branch } from "@/api/banks/@types";
import type { Bank } from "@/api/datti/@types";
import type { SubmitHandler } from "react-hook-form";

import { bankAccountSchema } from "@/schema";

import { createBanksClient } from "@/utils";

import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";

interface Props {
  defaultValues?: Bank;
  updateBankAccount: SubmitHandler<Bank>;
  deleteBankAccount: () => Promise<null | undefined>;
  reloadBankAccount: () => Promise<void>;
}

export const BankAccountForm = ({
  defaultValues,
  updateBankAccount,
  deleteBankAccount,
  reloadBankAccount,
}: Props) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Bank>({
    defaultValues,
    resolver: zodResolver(bankAccountSchema),
  });

  const [selectedBank, setSelectedBank] = useState<BankData>();
  const [selectedBranch, setSelectedBranch] = useState<Branch>();

  const banksClient = createBanksClient();

  return (
    <VStack
      bg="white"
      as="form"
      mt={5}
      gap={5}
      onSubmit={handleSubmit(updateBankAccount)}
    >
      <Flex w="full" gap={3}>
        <Spacer />
        {defaultValues?.uid ? (
          <Button onClick={deleteBankAccount} colorScheme="red">
            削除
          </Button>
        ) : null}
        <Button onClick={reloadBankAccount} colorScheme="green">
          再読み込み
        </Button>
      </Flex>
      <FormSelect<Bank, BankData>
        label="金融機関"
        placeholder="金融機関を選択"
        error={errors.bankCode}
        control={control}
        name="bankCode"
        loadOptions={async () => await banksClient.banks_json.$get()}
        getOptionLabel={(option) => `${option.name}銀行`}
        getOptionValue={(option) => option.code}
        value={selectedBank}
        onChangeSelect={(data) => {
          if (data) {
            setValue("bankCode", data?.code);
          }
        }}
      />
      {watch("bankCode") ? (
        <FormSelect<Bank, Branch>
          label="支店"
          placeholder="支店を選択"
          error={errors.branchCode}
          control={control}
          name="branchCode"
          loadOptions={async () =>
            await banksClient.banks
              ._bankCode_string(watch("bankCode"))
              .branches_json.$get()
          }
          getOptionLabel={(option) => `${option.name}支店`}
          getOptionValue={(option) => option.code}
          value={selectedBranch}
          onChangeSelect={(data) => {
            if (data) {
              setValue("branchCode", data?.code);
            }
          }}
        />
      ) : null}
      <FormInput
        label="口座番号"
        placeholder="口座番号を入力"
        register={register("accountCode")}
        error={errors.accountCode}
      />
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
