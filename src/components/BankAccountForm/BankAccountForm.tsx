import { Button, VStack } from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { Bank, Branch, getBank, getBanks, getBranches } from "@/features/bank";
import { getBranch } from "@/features/bank/api/getBranch";
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
    setValue,
    watch,
  } = useForm<BankAccountFormProps>({
    defaultValues,
  });

  const selectedBankCode = watch("bankCode");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  useEffect(() => {
    if (!selectedBankCode) {
      setSelectedBank(null);
      return;
    }
    getBank(selectedBankCode).then((bank) => {
      setSelectedBank(bank);
      return;
    });
  }, [selectedBankCode]);

  const [isDisplay, setDisplay] = useState(false);
  const selectedBranchCode = watch("branchCode");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  useEffect(() => {
    if (!selectedBranchCode) {
      setSelectedBranch(null);
      return;
    }
    getBranch(selectedBankCode, selectedBranchCode).then((branch) => {
      setSelectedBranch(branch);
      return;
    });
  }, [selectedBankCode, selectedBranchCode]);

  return (
    <VStack
      bg="white"
      as="form"
      px={10}
      mt={5}
      gap={5}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormSelect<BankAccountFormProps, Bank>
        label="金融機関"
        placeholder="金融機関を選択"
        error={errors.bankCode}
        control={control}
        name="bankCode"
        loadOptions={async (input) => {
          const banks = await getBanks(input);
          return banks;
        }}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.code}
        onChangeSelect={(newValue) => {
          setValue("branchCode", "");
          setDisplay(false);
          setInterval(() => {
            setDisplay(true);
          }, 400);
          setValue("bankCode", newValue?.code ?? "");
        }}
        value={selectedBank}
      />
      {watch("bankCode") && isDisplay && (
        <FormSelect<BankAccountFormProps, Branch>
          label="支店"
          placeholder="支店を選択"
          error={errors.branchCode}
          control={control}
          name="branchCode"
          loadOptions={async (input) => {
            const branches = await getBranches(watch("bankCode"), input);
            return branches;
          }}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.code}
          onChangeSelect={(newValue) => {
            setValue("branchCode", newValue?.code ?? "");
          }}
          value={selectedBranch}
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
