import { Center, CircularProgress, Container } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { Header } from "@/components/Header";
import { NotFound } from "@/components/NotFound";

export const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useRouter();
  const { status } = useSession();

  if (status === "loading") {
    return (
      <Center h="80vh">
        <CircularProgress isIndeterminate />
      </Center>
    );
  }

  if (pathname.match("/((?!404).+)") && status === "unauthenticated") {
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
