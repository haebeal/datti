import { Box, Container } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { getProfile } from "@/features/profile";

import { HeaderContents } from "./HeaderContents";

export const Header = () => {
  const { data: session, status } = useSession();

  const { isLoading, data } = useSWR(
    session?.credential.accessToken ?? null,
    (accessToken) => getProfile(accessToken),
  );

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HeaderContents
          isLoading={isLoading || status === "loading"}
          name={data?.name}
          photoUrl={data?.photoUrl}
        />
      </Container>
    </Box>
  );
};
