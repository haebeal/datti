import { HStack, Heading, Spacer } from "@chakra-ui/react";
import Link from "next/link";

import { AvatorMenu } from "@/components/AvatorMenu";
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
          <AvatorMenu isLoading={isLoading} name={name} photoUrl={photoUrl} />
          <SignoutButton />
        </>
      )}
    </HStack>
  );
};
