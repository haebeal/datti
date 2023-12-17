import { Meta, StoryObj } from "@storybook/react";

import { SignoutButton } from "@/components/SignoutButton";

const meta = {
  title: "Components/SignoutButton",
  component: SignoutButton,
  tags: ["autodocs"],
} satisfies Meta<typeof SignoutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
