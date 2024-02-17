import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";

import type { AppPropsWithLayout } from "next/app";
import type { Session } from "next-auth";

import { theme } from "@/utils";

const App = ({
  Component,
  pageProps: { session },
}: AppPropsWithLayout<{ session: Session }>) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>{getLayout(<Component />)}</ChakraProvider>
    </SessionProvider>
  );
};

export default App;
