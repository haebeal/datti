import { HStack, Spacer } from "@chakra-ui/react";

import { AvatorMenu } from "@/components/AvatorMenu";
import { SignoutButton } from "@/components/SignoutButton";

interface Props {
  isLoading: boolean;
  name: string;
  photoUrl?: string;
}

export const HeaderContents = ({ isLoading, name, photoUrl }: Props) => {
  if (isLoading) return;

  return (
    <HStack h="full" gap={7}>
      <Spacer />
      <AvatorMenu isLoading={isLoading} name={name} photoUrl={photoUrl} />
      <SignoutButton />
    </HStack>
  );
};
