import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";

import type { Preview } from "@storybook/react";

import { theme } from "@/utils";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    chakra: {
      theme,
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: "responsive",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
