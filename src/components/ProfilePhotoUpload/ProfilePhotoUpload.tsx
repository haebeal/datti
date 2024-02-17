import { Center, Image } from "@chakra-ui/react";
import { useRef } from "react";

interface Props {
  photoUrl?: string;
}

export const ProfilePhotoUpload = ({ photoUrl }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onClickUpload = () => {
    inputRef.current?.click();
  };

  const onChangeFile = () => {
    const files = inputRef.current?.files;
    console.log(files);
  };

  return (
    <Center>
      <Image
        borderStyle="solid"
        borderRadius="full"
        borderColor="gray.90"
        borderWidth={2}
        boxSize="80px"
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
  );
};
