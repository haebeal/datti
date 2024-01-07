import { Meta, StoryObj } from "@storybook/react";
import { Settings } from "./Settings";

const meta = {
  title: "Components/Settings",
  component: Settings,
  tags: ["autodocs"],
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    updateProfile: async () => {},
    updateBankAccount: async () => {},
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    updateProfile: async () => {},
    updateBankAccount: async () => {},
    isLoading: true,
  },
};
