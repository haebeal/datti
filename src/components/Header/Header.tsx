import { Box, Container } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import { HeaderContents } from "./HeaderContents";

export const Header = () => {
  const { data: session, status } = useSession();

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HeaderContents
          isLoading={status === "loading"}
          name={session?.profile?.name}
          photoUrl={session?.profile?.photoUrl}
        />
      </Container>
    </Box>
  );
};
