import { HStack, Heading, Spacer } from "@chakra-ui/react";
import Link from "next/link";

import { AvatarMenu } from "@/components/AvatarMenu";
import { SignoutButton } from "@/components/SignoutButton";

interface Props {
  isLoading: boolean;
  name?: string;
  photoUrl?: string;
}

export const HeaderContents = ({ isLoading, name, photoUrl }: Props) => {
  return (
    <HStack h="full" gap={7}>
      <Heading size="lg" as={Link} href="/dashboard">
        Datti
      </Heading>
      <Spacer />
      {!isLoading && (
        <>
          <AvatarMenu isLoading={isLoading} name={name} photoUrl={photoUrl} />
          <SignoutButton />
        </>
      )}
    </HStack>
  );
};
