import { Meta, StoryObj } from "@storybook/react";
import { SettingPanel } from "./SettingPanel";

const meta = {
  title: "Components/Settings",
  component: SettingPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof SettingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    updateProfile: async () => {},
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    updateProfile: async () => {},
    isLoading: true,
  },
};
