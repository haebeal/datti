import { Box, Container } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/react";

import { AvatorMenu } from "./AvatorMenu";

const meta = {
  title: "Components/AvatorMenu",
  component: AvatorMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AvatorMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    isLoading: false,
    name: "テストユーザー",
    photoUrl: "https://placehold.jp/150x150.png",
  },
};
