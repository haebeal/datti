import { Button, VStack } from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { getBanks, getBranches } from "@/features/bank";
import { useEffect, useState } from "react";

export interface BankAccountFormProps {
  bankCode: string;
  branchCode: string;
  accountCode: string;
}

interface Props {
  defaultValues?: BankAccountFormProps;
  onSubmit: SubmitHandler<BankAccountFormProps>;
}

export const BankAccountForm = ({ defaultValues, onSubmit }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BankAccountFormProps>({
    defaultValues,
  });

  const [isDisplayBranchSelect, setDisplayBranchSelect] = useState(false);
  useEffect(() => {
    setDisplayBranchSelect(false);
    setTimeout(() => setDisplayBranchSelect(true), 300);
  }, [setDisplayBranchSelect, watch("bankCode")]);

  return (
    <VStack
      bg="white"
      as="form"
      px={10}
      mt={5}
      gap={5}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormSelect<BankAccountFormProps, string>
        label="金融機関"
        placeholder="金融機関を選択"
        error={errors.bankCode}
        control={control}
        name="bankCode"
        loadOptions={async (input) => {
          const banks = await getBanks(input);
          const bankOptions: ReadonlyArray<{
            label: string;
            value: string;
          }> = banks.map((bank) => ({
            label: bank.name,
            value: bank.code,
          }));
          return bankOptions;
        }}
      />
      {watch("bankCode") && isDisplayBranchSelect && (
        <FormSelect<BankAccountFormProps, string>
          label="支店"
          placeholder="支店を選択"
          error={errors.branchCode}
          control={control}
          name="branchCode"
          loadOptions={async (input) => {
            const banks = await getBranches(watch("bankCode"), input);
            const branchCode: ReadonlyArray<{
              label: string;
              value: string;
            }> = banks.map((bank) => ({
              label: bank.name,
              value: bank.code,
            }));
            return branchCode;
          }}
        />
      )}
      <FormInput
        label="口座番号"
        placeholder="口座番号を入力"
        register={register("accountCode")}
        type="number"
        error={errors.accountCode}
      />
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
