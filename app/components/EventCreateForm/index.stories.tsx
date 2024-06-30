import { Meta, StoryObj } from "@storybook/react";
import { EventCreateForm } from ".";

const meta = {
  title: "EventForm",
  component: EventCreateForm,
  tags: ["autodocs"],
} satisfies Meta<typeof EventCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * イベント作成時に表示されるフォーム
 */
export const Default: Story = {
  name: "イベント作成フォーム",
  args: {
    defaultValue: {
      name: "テストイベント",
      eventedAt: new Date().toISOString(),
      payments: [],
    },
    members: [
      {
        userId: "001",
        email: "test001@example.com",
        name: "テストユーザー001",
        status: "me",
        photoUrl: "https://placehold.jp/3d4070/ffffff/300x300.png?text=001",
      },
      {
        userId: "002",
        email: "test002@example.com",
        name: "テストユーザー002",
        status: "friend",
        photoUrl: "https://placehold.jp/f41fcd/ffffff/300x300.png?text=001",
      },
    ],
  },
};
