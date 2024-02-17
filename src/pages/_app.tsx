import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from "recoil";

import type { AppProps } from "next/app";
import type { Session } from "next-auth";

import { theme } from "@/utils";

interface PageProps {
  session: Session;
}

const App = ({ Component, pageProps: { session } }: AppProps<PageProps>) => (
  <SessionProvider session={session}>
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <Component />
      </ChakraProvider>
    </RecoilRoot>
  </SessionProvider>
);

export default App;
