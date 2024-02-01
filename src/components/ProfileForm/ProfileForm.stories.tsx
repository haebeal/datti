import { Meta, StoryObj } from "@storybook/react";
import { ProfileForm } from "./ProfileForm";

const meta = {
  title: "Components/ProfileForm",
  component: ProfileForm,
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  args: {
    defaultValues: {
      email: "test@example.com",
      name: "テストユーザー",
      picture: "https://placehold.jp/150x150.png",
    },
    isUploading: false,
    updateProfile: async () => {},
    uploadProfilePhoto: async () => {},
  },
};

/**
 * 画像アップロード中の表示
 */
export const Uploading: Story = {
  args: {
    defaultValues: {
      email: "test@example.com",
      name: "テストユーザー",
      picture: "https://placehold.jp/150x150.png",
    },
    isUploading: true,
    updateProfile: async () => {},
    uploadProfilePhoto: async () => {},
  },
};
