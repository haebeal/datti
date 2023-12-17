import { Avatar, HStack, Heading, Spacer } from "@chakra-ui/react";

import { SignoutButton } from "@/components/SignoutButton";

interface Props {
  isLoading: boolean;
  name: string;
  photoUrl?: string;
}

export const HeaderContents = ({ isLoading, name, photoUrl }: Props) => {
  if (isLoading) return;

  return (
    <HStack h="full">
      <Avatar size="md" ignoreFallback aria-label="profile" src={photoUrl} />
      <Heading size="sm">{name}さん</Heading>
      <Spacer />
      <SignoutButton />
    </HStack>
  );
};
