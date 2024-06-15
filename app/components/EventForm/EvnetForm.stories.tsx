import { Meta, StoryObj } from "@storybook/react";
import { EventForm } from ".";

const meta = {
  title: "EventForm",
  component: EventForm,
  tags: ["autodocs"],
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * イベント作成時に表示されるフォーム
 */
export const CreateForm: Story = {
  name: "イベント作成フォーム",
  args: {
    defaultValue: {
      name: "テストイベント",
      evented_at: new Date().toISOString(),
      payments: [],
    },
    method: "post",
  },
};

/**
 * イベント更新時に表示されるフォーム
 */
export const UpdateForm: Story = {
  name: "イベント更新フォーム",
  args: {
    defaultValue: {
      name: "テストイベント",
      evented_at: new Date().toISOString(),
      payments: [],
    },
    method: "put",
  },
};
