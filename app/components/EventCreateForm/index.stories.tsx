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
  },
};
