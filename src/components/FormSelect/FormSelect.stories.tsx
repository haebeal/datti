import { ComponentProps } from "react";
import { FormSelect } from "./FormSelect";

import { getBanks } from "@/features/bank";
import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";

const FormSelectWithForm = ({
  label,
  placeholder,
  readonly,
}: Pick<
  ComponentProps<typeof FormSelect>,
  "label" | "placeholder" | "readonly"
>) => {
  const {
    control,
    formState: { errors },
  } = useForm<{ bankCode: string }>();
  const loadBankOptions = async (input: string) => {
    try {
      const banks = await getBanks(input);
      return banks.map((bank) => ({
        label: `${bank.name}銀行`,
        value: bank.code,
      }));
    } catch (_) {
      return [];
    }
  };

  return (
    <FormSelect
      label={label}
      placeholder={placeholder}
      readonly={readonly}
      error={errors.bankCode}
      control={control}
      name="bankCode"
      loadOptions={loadBankOptions}
    />
  );
};

const meta = {
  title: "Components/FormSelect",
  component: FormSelectWithForm,
  tags: ["autodocs"],
} satisfies Meta<typeof FormSelectWithForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "金融機関",
    placeholder: "金融機関を選択",
    readonly: false,
  },
};

export const Readonly: Story = {
  args: {
    label: "金融機関",
    placeholder: "金融機関を選択",
    readonly: true,
  },
};
