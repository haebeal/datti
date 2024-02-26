import type { Meta, StoryObj } from "@storybook/react";

import { FriendCard } from "./FriendCard";

const meta = {
  title: "Molecules/FriendCard",
  component: FriendCard,
  tags: ["autodocs"],
  args: {
    friend: {
      uid: "0001",
      name: "テストユーザー",
      photoUrl: "https://bit.ly/dan-abramov",
      status: "friend",
    },
    onClickApply: (friend) => alert(JSON.stringify(friend)),
    onClickDeny: (friend) => alert(JSON.stringify(friend)),
  },
} satisfies Meta<typeof FriendCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * フレンド表示
 */
export const Friend: Story = {
  name: "フレンド",
  args: {
    friend: {
      uid: "0001",
      name: "テストユーザー",
      photoUrl: "https://bit.ly/dan-abramov",
      status: "friend",
    },
  },
};

/**
 * フレンド申請中表示
 */
export const Applying: Story = {
  name: "申請中",
  args: {
    friend: {
      uid: "0001",
      name: "テストユーザー",
      photoUrl: "https://bit.ly/dan-abramov",
      status: "applying",
    },
  },
};

/**
 * フレンド申請を受けている際の表示
 */
export const Applied: Story = {
  name: "申請受理中",
  args: {
    friend: {
      uid: "0001",
      name: "テストユーザー",
      photoUrl: "https://bit.ly/dan-abramov",
      status: "applied",
    },
  },
};

/**
 * スマートフォン表示
 */
export const SP: Story = {
  name: "スマートフォン",
  parameters: {
    viewport: { defaultViewport: "iphone12" },
  },
};
