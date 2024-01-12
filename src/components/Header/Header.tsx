import { Box, Container } from "@chakra-ui/react";

import { HeaderContents } from "@/components/Header/HeaderContents";
import { useProfile } from "@/hooks/useProfile";

export const Header = () => {
  const { profile, isLoading } = useProfile();

  return (
    <Box as="header" h="80px" bg="white">
      <Container maxW="container.xl" h="full">
        <HeaderContents
          isLoading={isLoading}
          name={profile?.name}
          photoUrl={profile?.photoUrl}
        />
      </Container>
    </Box>
  );
};
