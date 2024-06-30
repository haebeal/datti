import { defer } from "@remix-run/cloudflare";
import { createRemixStub } from "@remix-run/testing";
import type { Meta, StoryObj } from "@storybook/react";

import { Header } from ".";

const meta = {
  title: "Header",
  component: Header,
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  name: "デフォルト",
  decorators: [
    (Story) => {
      const RemixSub = createRemixStub([
        {
          path: "/",
          Component: Story,
          loader: () =>
            defer({
              profile: {
                userId: "0001",
                name: "テストユーザー",
                email: "test@example.com",
                photoUrl: "https://i.pravatar.cc/300",
                bank: {
                  bankCode: "0001",
                  branchCode: "001",
                  accountCode: "1234567",
                },
              },
            }),
        },
      ]);
      return <RemixSub />;
    },
  ],
};

/**
 * 読み込み中の表示
 */
export const Loading: Story = {
  name: "読み込み中",
  decorators: [
    (Story) => {
      const RemixSub = createRemixStub([
        {
          path: "/",
          Component: Story,
          loader: () =>
            defer({
              profile: new Promise(() => {}),
            }),
        },
      ]);
      return <RemixSub />;
    },
  ],
};
