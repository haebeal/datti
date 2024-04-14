import { Meta, StoryObj } from "@storybook/react";
import { ProfileForm } from "~/components/ProfileForm";

const meta = {
  title: "ProfileForm",
  component: ProfileForm,
  tags: ["autodocs"],
  args: {
    profile: {
      uid: "0001",
      name: "テストユーザー",
      email: "test@example.com",
      photoUrl: "https://i.pravatar.cc/300",
    },
  },
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  name: "デフォルト",
};
