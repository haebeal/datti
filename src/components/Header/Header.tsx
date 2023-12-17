import {
  Avatar,
  Box,
  Container,
  HStack,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import useSWR from "swr";

import { SignoutButton } from "@/components/SignoutButton";

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
  if (!accessToken) {
    throw new Error("cannot get access token");
  }
  const response = await fetch(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer: ${accessToken}`,
    },
  });
  const result = await response.json();
  return result;
};

export const Header = () => {
  const { data: session, status } = useSession();

  const { isLoading, data, error } = useSWR(
    session?.credential.accessToken
      ? ["/api/me", session.credential.accessToken]
      : null,
    ([path, token]) => fetcher<User>(path, token),
  );

  const onClickAuthButton = () => {
    signOut({
      callbackUrl: "/",
    });
  };

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        {!isLoading && status !== "loading" && (
          <HStack h="full">
            <Avatar
              size="md"
              ignoreFallback
              aria-label="profile"
              src={data?.photoUrl ?? undefined}
            />
            <Heading size="sm">{data?.name}さん</Heading>
            <Spacer />
            <SignoutButton onClick={onClickAuthButton} />
          </HStack>
        )}
      </Container>
    </Box>
  );
};
