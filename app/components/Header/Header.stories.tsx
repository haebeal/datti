import type { Meta, StoryObj } from "@storybook/react";

import { Header } from ".";

const meta = {
  title: "Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    profile: {
      uid: "0001",
      name: "テストユーザー",
      email: "test@example.com",
      photoUrl: "https://i.pravatar.cc/300",
      bank: {
        bankCode: "0001",
        branchCode: "001",
        accountCode: "1234567",
      },
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  name: "デフォルト",
};
