import type { Meta, StoryObj } from "@storybook/react";

import { FormInput } from "./FormInput";

const meta = {
  title: "Molecules/FormInput",
  component: FormInput,
  tags: ["autodocs"],
  args: {
    label: "ユーザー名",
    placeholder: "ユーザー名を入力",
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  name: "デフォルト",
};

/**
 * 読み取り専用
 */
export const Readonly: Story = {
  name: "読み取り専用",
  args: {
    readOnly: true,
  },
};

/**
 * 非活性状態
 */
export const Disable: Story = {
  name: "非活性",
  args: {
    disabled: true,
  },
};

/**
 * バリデーションエラー時の表示
 */
export const Error: Story = {
  name: "エラー",
  args: {
    error: "ユーザー名を入力してください",
  },
};
