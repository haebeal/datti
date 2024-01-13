import { Box, Container } from "@chakra-ui/react";
import { Header } from "./Header";

import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <Box as="header" h="80px" bg="white" mx={5} height="200px">
        <Container maxW="container.xl" h="full">
          <Story />
        </Container>
      </Box>
    ),
  ],
};
