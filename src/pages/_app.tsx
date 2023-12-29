import { ChakraProvider, Container, useToast } from "@chakra-ui/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { SWRConfig } from "swr";

import type { LayoutType } from "@/utils";
import { HttpError, getTheme } from "@/utils";

import { Header } from "@/components/Header";

export interface PageProps {
  layout?: LayoutType;
  session: Session;
}

const App = ({
  Component,
  pageProps: { session, layout },
}: AppProps<PageProps>) => {
  const theme = getTheme(layout);
  const router = useRouter();
  const toast = useToast();

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <SWRConfig
          value={{
            onError: (error) => {
              if (error instanceof HttpError) {
                if (error.status === 401) {
                  router.push("/401");
                }
                toast({
                  status: "error",
                  title: error.message,
                });
              }
            },
          }}
        >
          {(layout === "main" || layout === undefined) && <Header />}
          <Container maxW="container.xl">
            <Component />
          </Container>
        </SWRConfig>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default App;
