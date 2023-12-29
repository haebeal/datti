import { extendTheme } from "@chakra-ui/react";

export type LayoutType = "top" | "main" | "error";

export const getTheme = (layout?: LayoutType) => {
  return extendTheme({
    styles: {
      global: {
        body: {
          backgroundColor: layout === "top" ? "blue.400" : "gray.100",
          color: layout === "top" && "white",
        },
      },
    },
  });
};
