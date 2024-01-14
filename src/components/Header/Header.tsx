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
import { useProfile } from "@/hooks/useProfile";
import { useAuth0 } from "@auth0/auth0-react";

export const Header = () => {
  const { logout } = useAuth0();
  const { profile, isLoading } = useProfile();
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HStack h="full" gap={7}>
          <Heading size="lg" as={Link} href="/dashboard">
            Datti
          </Heading>
          <Spacer />
          {!isLoading && (
            <>
              <AvatarMenu
                isLoading={isLoading}
                isMobile={isMobile}
                profile={profile}
              />
              {!isMobile && (
                <Button
                  colorScheme="red"
                  onClick={() =>
                    logout({
                      logoutParams: {
                        returnTo: process.env.NEXT_PUBLIC_BASE_URL,
                      },
                    })
                  }
                >
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
