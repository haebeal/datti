import type { Meta, StoryObj } from "@storybook/react";
import { Label, RequirementBadge, SupportText } from "..";
import { DatePicker } from "./DatePicker";

const meta = {
	title: "Component/DatePicker",
	component: DatePicker,
	tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
	decorators: [
		(Story, context) => (
			<div className="flex flex-col gap-2">
				<Label htmlFor={context.args.id}>
					ラベル<RequirementBadge>※必須</RequirementBadge>
				</Label>
				<SupportText id={context.args["aria-describedby"]}>
					サポートテキスト
				</SupportText>
				<Story />
			</div>
		),
	],
};
