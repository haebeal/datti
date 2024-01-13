import { Header } from "@/components/Header";
import { useAuth0 } from "@auth0/auth0-react";
import { Center, CircularProgress, Container } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";

export const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const { pathname, push } = useRouter();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (pathname.match("/((?!404).+)") && !isLoading && !isAuthenticated) {
      push("/401");
    }
  }, [pathname, isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <Center h="80vh">
        <CircularProgress isIndeterminate />
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
