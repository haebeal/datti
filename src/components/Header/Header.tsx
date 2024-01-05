import { Box, Container } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { fetcher } from "@/utils";

import { HeaderContents } from "./HeaderContents";

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  accountCode: string;
  bankCode: string;
  branchCode: string;
}

export const Header = () => {
  const { data: session, status } = useSession();

  const { isLoading, data } = useSWR(
    session?.credential.accessToken
      ? ["/api/me", session.credential.accessToken]
      : null,
    ([path, token]) => fetcher<User>(path, token),
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
