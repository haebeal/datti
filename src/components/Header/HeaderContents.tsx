import { HStack, Heading, Spacer, useMediaQuery } from "@chakra-ui/react";
import Link from "next/link";

import { AvatarMenu } from "@/components/AvatarMenu";
import { SignoutButton } from "@/components/SignoutButton";

interface Props {
  isLoading: boolean;
  name?: string;
  photoUrl?: string;
}

export const HeaderContents = ({ isLoading, name, photoUrl }: Props) => {
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  return (
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
            name={name}
            photoUrl={photoUrl}
          />
          {!isMobile && <SignoutButton />}
        </>
      )}
    </HStack>
  );
};
