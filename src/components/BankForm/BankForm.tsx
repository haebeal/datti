import { Button, Flex, Skeleton, Spacer, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";

import type { Bank as BankData, Branch } from "@/api/banks/@types";
import type { Bank } from "@/api/datti/@types";
import type { SubmitHandler } from "react-hook-form";

import { bankAccountSchema } from "@/schema";

import { createBanksClient } from "@/utils";

import { FormSelect } from "@/components/FormSelect";
import { FormInput } from "@/components/atoms/FormInput";

interface Props {
  defaultValues?: Bank;
  onSubmit: SubmitHandler<Bank>;
  onDelete: () => Promise<void>;
}

export const BankForm = ({ defaultValues, onSubmit, onDelete }: Props) => {
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

  const banksClient = createBanksClient();

  const selectBankId = useId();
  const [selectedBank, setSelectedBank] = useState<BankData | null>(null);
  const getBank = async () => {
    const response = await banksClient.banks
      ._bankCode_string_json(watch("bankCode"))
      .$get();
    setSelectedBank(response);
  };
  useEffect(() => {
    if (watch("bankCode") && selectedBank === null) {
      getBank();
    }
  }, [watch("bankCode")]);

  const selectBranchId = useId();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const getBranch = async () => {
    const response = await banksClient.banks
      ._bankCode_string(watch("bankCode"))
      .branches._branchCode_json(watch("branchCode"))
      .$get();
    setSelectedBranch(response);
  };
  const [isLoadingBranch, setLoadingBranch] = useState(false);
  const loadBranch = async () => {
    setLoadingBranch(true);
    await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
    setLoadingBranch(false);
  };
  useEffect(() => {
    if (watch("bankCode") && watch("branchCode") && selectedBranch === null) {
      getBranch();
    }
  }, [watch("bankCode")]);

  return (
    <VStack bg="white" as="form" gap={5} onSubmit={handleSubmit(onSubmit)}>
      <Flex w="full" gap={3}>
        <Spacer />
        {defaultValues?.uid ? (
          <Button onClick={onDelete} colorScheme="red">
            削除
          </Button>
        ) : null}
      </Flex>
      <FormSelect<Bank, BankData>
        label="金融機関"
        id={selectBankId}
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
            setSelectedBank(data);
            setValue("branchCode", "");
            setSelectedBranch(null);
            loadBranch();
          } else {
            setValue("bankCode", "");
            setSelectedBank(null);
            setValue("branchCode", "");
            setSelectedBranch(null);
          }
        }}
      />
      {watch("bankCode") && (
        <Skeleton w="full" isLoaded={!isLoadingBranch}>
          <FormSelect<Bank, Branch>
            label="支店"
            id={selectBranchId}
            placeholder="支店を選択"
            error={errors.branchCode}
            control={control}
            name="branchCode"
            loadOptions={async () =>
              await banksClient.banks
                ._bankCode_string(watch("bankCode"))
                .branches_json.$get()
            }
            getOptionLabel={(option) => `${option.name}`}
            getOptionValue={(option) => option.code}
            value={selectedBranch}
            onChangeSelect={(data) => {
              if (data) {
                setSelectedBranch(data);
                setValue("branchCode", data?.code);
              } else {
                setSelectedBranch(null);
                setValue("branchCode", "");
              }
            }}
          />
        </Skeleton>
      )}
      <FormInput
        label="口座番号"
        placeholder="口座番号を入力"
        {...register("accountCode")}
        type="text"
        error={errors.accountCode?.message}
      />
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
