import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Link,
  Spacer,
  useMediaQuery,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

import { AvatarMenu } from "@/components/AvatarMenu";
import { useProfile } from "@/hooks/useProfile";

export const Header = () => {
  const { status, data: session } = useSession();
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const { profile } = useProfile();

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HStack h="full" gap={7}>
          <Heading size="lg" as={Link} href="/dashboard">
            Datti
          </Heading>
          <Spacer />
          {status !== "unauthenticated" && (
            <>
              {profile && (
                <AvatarMenu
                  isLoading={status === "loading"}
                  isMobile={isMobile}
                  profile={profile}
                />
              )}
              {!isMobile && (
                <Button colorScheme="red" onClick={() => signOut()}>
                  ログアウト
                </Button>
              )}
            </>
          )}
        </HStack>
      </Container>
    </Box>
  );
};
