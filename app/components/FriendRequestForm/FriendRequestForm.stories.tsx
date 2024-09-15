import type { Meta, StoryObj } from "@storybook/react";
import { FriendRequestForm } from "~/components/FriendRequestForm";
import { Card, CardContent } from "~/components/ui/card";

const meta = {
	title: "FriendRequestForm",
	component: FriendRequestForm,
	tags: ["autodocs"],
	args: {
		users: [
			{
				userId: "001",
				name: "テストユーザー1",
				email: "test01@example.com",
				photoUrl: "https://i.pravatar.cc/300?img=1",
				bank: {
					bankCode: "0001",
					branchCode: "001",
					accountCode: "1234567",
				},
			},
			{
				userId: "002",
				name: "テストユーザー2",
				email: "test02@example.com",
				photoUrl: "https://i.pravatar.cc/300?img=2",
				bank: {
					bankCode: "0005",
					branchCode: "001",
					accountCode: "1234567",
				},
			},
		],
	},
	decorators: (Story) => (
		<Card>
			<CardContent>
				<Story />
			</CardContent>
		</Card>
	),
} satisfies Meta<typeof FriendRequestForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト表示
 */
export const Default: Story = {
	name: "デフォルト",
};
