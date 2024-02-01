import { Meta, StoryObj } from "@storybook/react";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";

const meta = {
  title: "Components/ProfilePhotoUpload",
  component: ProfilePhotoUpload,
  tags: ["autodocs"],
} satisfies Meta<typeof ProfilePhotoUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    isLoading: false,
    photoUrl: "https://bit.ly/dan-abramov",
    updatePhoto: async (file) => {
      alert(file.name);
    },
  },
};
