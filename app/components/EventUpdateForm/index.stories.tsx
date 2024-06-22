import { Meta, StoryObj } from "@storybook/react";
import { EventUpdateForm } from ".";

const meta = {
  title: "EventForm",
  component: EventUpdateForm,
  tags: ["autodocs"],
} satisfies Meta<typeof EventUpdateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * イベント更新時に表示されるフォーム
 */
export const Default: Story = {
  name: "イベント更新フォーム",
  args: {
    defaultValue: {
      name: "テストイベント",
      evented_at: new Date().toISOString(),
      payments: [],
    },
  },
};
