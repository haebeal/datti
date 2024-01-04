import { Box, Container } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import { HttpError } from "@/errors";

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

const fetcher = async <T,>(
  path: string,
  accessToken: string | null | undefined,
): Promise<T> => {
  const response = await fetch(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer: ${accessToken}`,
    },
  });
  const result = await response.json();

  if (response.ok) {
    return result;
  }

  throw new HttpError(response);
};

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
