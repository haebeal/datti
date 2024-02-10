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

import { AvatarMenu } from "@/components/AvatarMenu";
import { useFirebase } from "@/hooks";

export const Header = () => {
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const { isLoading, currentUser, signOut } = useFirebase();

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HStack h="full" gap={7}>
          <Heading size="lg" as={Link} href="/dashboard">
            Datti
          </Heading>
          <Spacer />
          {currentUser !== null && (
            <>
              {currentUser && (
                <AvatarMenu
                  isLoading={isLoading}
                  isMobile={isMobile}
                  user={currentUser}
                  signOut={signOut}
                />
              )}
              {!isMobile && (
                <Button colorScheme="red" onClick={signOut}>
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
