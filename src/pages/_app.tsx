import { ChakraProvider, Container, useToast } from "@chakra-ui/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { SWRConfig } from "swr";

import type { LayoutType } from "@/utils";
import { getTheme } from "@/utils";

import { Header } from "@/components/Header";
import { HttpError } from "@/errors";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export interface PageProps {
  layout?: LayoutType;
  session: Session;
}

const App = ({
  Component,
  pageProps: { session, layout },
}: AppProps<PageProps>) => {
  const theme = getTheme(layout);

  const { isLoading, isAuthenticated } = useAuth0();
  const { pathname, push } = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (pathname.match("/((?!401|404).+)") && !isLoading && !isAuthenticated) {
      push("/401");
    }
  }, [pathname]);

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      }}
    >
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
          {(layout === "main" || layout === undefined) && <Header />}
          <Container maxW="container.xl">
            <Component />
          </Container>
        </SWRConfig>
      </ChakraProvider>
    </Auth0Provider>
  );
};

export default App;
