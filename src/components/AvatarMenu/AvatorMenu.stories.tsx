import type { Meta, StoryObj } from "@storybook/react";

import { AvatarMenu } from "./AvatarMenu";

const meta = {
  title: "Components/AvatarMenu",
  component: AvatarMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AvatarMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    isLoading: false,
    isMobile: false,
    name: "テストユーザー",
    photoUrl: "https://placehold.jp/150x150.png",
  },
};

export const Mobile: Story = {
  args: {
    isLoading: false,
    isMobile: true,
    name: "テストユーザー",
    photoUrl: "https://placehold.jp/150x150.png",
  },
};
