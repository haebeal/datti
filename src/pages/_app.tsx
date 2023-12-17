import { ChakraProvider, Container } from "@chakra-ui/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

import { Header } from "@/components/Header";
import type { LayoutType } from "@/utils";
import { getTheme } from "@/utils";

export interface PageProps {
  layout?: LayoutType;
  session: Session;
}

const App = ({
  Component,
  pageProps: { session, layout },
}: AppProps<PageProps>) => {
  const theme = getTheme(layout);

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        {layout !== "top" && <Header />}
        <Container maxW="container.xl">
          <Component />
        </Container>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default App;
