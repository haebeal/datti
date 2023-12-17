import { Box, Container } from "@chakra-ui/react";
import { HeaderContents } from "./HeaderContents";

import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Header",
  component: HeaderContents,
  tags: ["autodocs"],
} satisfies Meta<typeof HeaderContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [
    (Story) => (
      <Box as="header" h="80px" bg="white">
        <Container maxW="container.xl" h="full">
          <Story />
        </Container>
      </Box>
    ),
  ],
  args: {
    isLoading: false,
    name: "テストユーザー",
    photoUrl: "https://placehold.jp/150x150.png",
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => (
      <Box as="header" h="80px" bg="white">
        <Container maxW="container.xl" h="full">
          <Story />
        </Container>
      </Box>
    ),
  ],
  args: {
    isLoading: true,
  },
};
