import { ChakraProvider, useToast } from "@chakra-ui/react";
import type { AppPropsWithLayout } from "next/app";
import { SWRConfig } from "swr";

import { getTheme } from "@/utils";

import { HttpError } from "@/errors";
import { Auth0Provider } from "@auth0/auth0-react";

const App = ({ Component }: AppPropsWithLayout) => {
  const theme = getTheme();
  const getLayout = Component.getLayout ?? ((page) => page);

  const toast = useToast();

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
          {getLayout(<Component />)}
        </SWRConfig>
      </ChakraProvider>
    </Auth0Provider>
  );
};

export default App;
