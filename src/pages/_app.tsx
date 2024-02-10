import { ChakraProvider, useToast } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";

import type { AppPropsWithLayout } from "next/app";
import type { Session } from "next-auth";

import { theme } from "@/utils";

import { HttpError } from "@/errors";

const App = ({
  Component,
  pageProps: { session },
}: AppPropsWithLayout<{ session: Session }>) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  const toast = useToast();

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <SWRConfig
          value={{
            onError: (error) => {
              if (error instanceof HttpError) {
                toast({
                  status: "error",
                  title: error.message,
                });
              }
            },
          }}
        >
          {getLayout(<Component />)}
        </SWRConfig>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default App;
