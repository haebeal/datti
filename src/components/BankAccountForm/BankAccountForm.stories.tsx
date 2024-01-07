import { BankAccountForm } from "./BankAccountForm";

import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/BankAccountForm",
  component: BankAccountForm,
  tags: ["autodocs"],
} satisfies Meta<typeof BankAccountForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    defaultValues: undefined,
    onSubmit: async () => {},
  },
};
