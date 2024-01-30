import { ChakraProvider, useToast } from "@chakra-ui/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppPropsWithLayout } from "next/app";
import { SWRConfig } from "swr";

import { HttpError } from "@/errors";
import { theme } from "@/utils";

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
