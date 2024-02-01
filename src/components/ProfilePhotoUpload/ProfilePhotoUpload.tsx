import { Box, Center, Image, Skeleton } from "@chakra-ui/react";
import { useRef } from "react";

interface Props {
  isLoading: boolean;
  photoUrl: string;
  updatePhoto: (file: File) => Promise<void>;
}

export const ProfilePhotoUpload = ({
  isLoading,
  photoUrl,
  updatePhoto,
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onClickUpload = () => {
    inputRef.current?.click();
  };

  const onChangeFile = () => {
    const files = inputRef.current?.files;
    if (files?.length === 1) {
      updatePhoto(files[0]);
    }
  };

  return (
    <Skeleton isLoaded={!isLoading}>
      <Center h="150px" w="150px">
        <Image
          borderStyle="solid"
          borderRadius="full"
          borderColor="gray.90"
          borderWidth={2}
          boxSize="120px"
          _hover={{
            cursor: "pointer",
          }}
          onClick={onClickUpload}
          src={photoUrl}
          alt="Profile Photo"
        />
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".png, .jpeg, .webp"
          onChange={onChangeFile}
        />
      </Center>
    </Skeleton>
  );
};
