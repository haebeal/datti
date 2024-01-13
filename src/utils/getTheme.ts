import { extendTheme } from "@chakra-ui/react";

export const getTheme = () => {
  return extendTheme({
    styles: {
      global: {
        body: {
          backgroundColor: "gray.100",
        },
      },
    },
  });
};
