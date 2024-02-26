import type { Meta, StoryObj } from "@storybook/react";

import { FriendList } from "./FriendList";

const meta = {
  title: "Organisms/FriendList",
  component: FriendList,
  tags: ["autodocs"],
  args: {
    friends: [
      {
        uid: "0001",
        name: "佐藤",
        photoUrl: "https://bit.ly/dan-abramov",
        status: "friend",
      },
      {
        uid: "0002",
        name: "田中",
        photoUrl: "https://bit.ly/kent-c-dodds",
        status: "applying",
      },
      {
        uid: "0003",
        name: "鈴木",
        photoUrl: "https://bit.ly/code-beast",
        status: "applied",
      },
    ],
  },
} satisfies Meta<typeof FriendList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  name: "デフォルト",
};

/**
 * フレンドが存在しない場合の表示
 */
export const NoFriends: Story = {
  name: "フレンド非存在",
  args: {
    friends: [],
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
