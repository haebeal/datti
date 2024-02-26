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
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

export const Header = () => {
  const { data: session } = useSession();

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
              <Avatar borderColor="gray.100" src={session?.user.photoUrl} />
            </MenuButton>
            <MenuList>
              <MenuGroup title={session?.user.name}>
                <MenuItem as={Link} href="/settings/profile">
                  設定
                </MenuItem>
                <MenuItem as={Link} href="/friend">
                  フレンド
                </MenuItem>
                <MenuItem
                  display={{ base: "none", md: "block" }}
                  onClick={onClickSignOut}
                >
                  ログアウト
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
          <Button
            display={{ base: "none", md: "block" }}
            colorScheme="red"
            onClick={onClickSignOut}
          >
            ログアウト
          </Button>
        </HStack>
      </Container>
    </Box>
  );
};
