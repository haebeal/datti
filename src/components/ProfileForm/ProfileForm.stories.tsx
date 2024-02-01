import { Meta, StoryObj } from "@storybook/react";
import { ProfileForm } from "./ProfileForm";

const meta = {
  title: "Components/ProfileForm",
  component: ProfileForm,
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    defaultValues: {
      email: "test@example.com",
      name: "テストユーザー",
      picture: "https://placehold.jp/150x150.png",
    },
    updateProfile: async () => {},
    uploadProfilePhoto: async () => {},
  },
};
