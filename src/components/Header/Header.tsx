import {
  Avatar,
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Link,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Spacer,
  useMediaQuery,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

import { useProfile } from "@/hooks/useProfile";

export const Header = () => {
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  const { data: session, status } = useSession();

  if (status !== "authenticated") return;

  const { profile } = useProfile(session.idToken);

  const onClickSignOut = () => {
    signOut();
  };

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HStack h="full" gap={7}>
          <Heading size="lg" as={Link} href="/dashboard">
            Datti
          </Heading>
          <Spacer />
          <Menu>
            <MenuButton>
              <Avatar borderColor="gray.100" src={profile?.photoUrl} />
            </MenuButton>
            <MenuList>
              <MenuGroup title={profile?.name}>
                <MenuItem as={Link} href="/setting">
                  設定
                </MenuItem>
                {isMobile ? (
                  <MenuItem onClick={onClickSignOut}>ログアウト</MenuItem>
                ) : null}
              </MenuGroup>
            </MenuList>
          </Menu>
          {!isMobile && (
            <Button colorScheme="red" onClick={onClickSignOut}>
              ログアウト
            </Button>
          )}
        </HStack>
      </Container>
    </Box>
  );
};
