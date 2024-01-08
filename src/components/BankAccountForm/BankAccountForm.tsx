import { Button, VStack } from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import {
  Bank,
  Branch,
  getBank,
  getBanks,
  getBranch,
  getBranches,
} from "@/features/bank";
import { SingleValue } from "chakra-react-select";
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

  const [selectedBank, setSelectedBank] = useState<Bank>();
  const [selectedBranch, setSelectedBranch] = useState<Branch>();
  useEffect(() => {
    // 表示用 金融機関の取得
    if (!watch("bankCode")) {
      setSelectedBank(undefined);
      return;
    }
    getBank(watch("bankCode"))
      .then((bank) => setSelectedBank(bank))
      .catch(() => setSelectedBank(undefined));
  }, [watch("bankCode")]);
  useEffect(() => {
    // 表示用 支店の取得
    if (!watch("bankCode") || !watch("branchCode")) {
      setSelectedBranch(undefined);
      return;
    }
    getBranch(watch("bankCode"), watch("branchCode"))
      .then((branch) => setSelectedBranch(branch))
      .catch(() => setSelectedBranch(undefined));
  }, [watch("branchCode")]);

  // 金融機関変更時、支店の初期化と再レンダリング
  const [isLoadingBranch, setLoadingBranch] = useState(false);
  const onChangeBankOption = (newValue: SingleValue<Bank>) => {
    setValue("bankCode", newValue?.code ?? "");
    setValue("branchCode", "");
    setLoadingBranch(true);
    setInterval(() => {
      setLoadingBranch(false);
    }, 500);
  };
  const onChangeBranch = (newValue: SingleValue<Branch>) => {
    setValue("branchCode", newValue?.code ?? "");
  };

  // 金融機関オプションの非同期取得
  const onLoadBankOptions = async (input: string) => {
    try {
      const banks = await getBanks(input);
      return banks;
    } catch (_) {
      return [];
    }
  };
  // 支店オプションの非同期取得
  const onLoadBranchOptions = async (input: string) => {
    try {
      const branches = await getBranches(watch("bankCode"), input);
      return branches;
    } catch (_) {
      return [];
    }
  };

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
        loadOptions={onLoadBankOptions}
        getOptionLabel={(option) => `${option.name}銀行`}
        getOptionValue={(option) => option.code}
        value={selectedBank}
        onChangeSelect={onChangeBankOption}
      />
      {watch("bankCode") && (
        <FormSelect<BankAccountFormProps, Branch>
          label="支店"
          isLoading={isLoadingBranch}
          placeholder="支店を選択"
          error={errors.branchCode}
          control={control}
          name="branchCode"
          loadOptions={onLoadBranchOptions}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.code}
          value={selectedBranch}
          onChangeSelect={onChangeBranch}
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
