import { useAuth0 } from "@auth0/auth0-react";
import { Center, CircularProgress, Container } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { Header } from "@/components/Header";
import { NotFound } from "@/components/NotFound";

export const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useRouter();
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Center h="80vh">
        <CircularProgress isIndeterminate />
      </Center>
    );
  }

  if (pathname.match("/((?!404).+)") && !isAuthenticated) {
    return (
      <Center h="80vh">
        <NotFound />
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Container maxW="container.xl">{children}</Container>
    </>
  );
};
