import { Meta, StoryObj } from "@storybook/react";
import { EventForm } from ".";

const meta = {
  title: "EventForm",
  component: EventForm,
  tags: ["autodocs"],
  args: {
    defaultValue: {
      name: "テストイベント",
      evented_at: new Date().toISOString(),
    },
  },
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
  name: "デフォルト",
};
