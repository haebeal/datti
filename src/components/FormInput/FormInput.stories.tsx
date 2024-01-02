import { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "./FormInput";

import { Meta, StoryObj } from "@storybook/react";

const FormInputWithForm = ({
  label,
  placeholder,
  type,
  readonly,
}: Pick<
  ComponentProps<typeof FormInput>,
  "label" | "placeholder" | "type" | "readonly"
>) => {
  const {
    register,
    formState: { errors },
  } = useForm<{ email: string }>();
  return (
    <FormInput
      label={label}
      placeholder={placeholder}
      type={type}
      readonly={readonly}
      register={register("email")}
      error={errors.email}
    />
  );
};

const meta = {
  title: "Components/FormInput",
  component: FormInputWithForm,
  tags: ["autodocs"],
} satisfies Meta<typeof FormInputWithForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "メールアドレス",
    placeholder: "メールアドレスを入力",
    readonly: false,
    type: "email",
  },
};

export const Readonly: Story = {
  args: {
    label: "メールアドレス",
    placeholder: "メールアドレスを入力",
    readonly: true,
    type: "email",
  },
};
