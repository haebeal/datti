import {
  Button,
  Flex,
  HStack,
  Skeleton,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { watch } from "fs";
import { FormInput } from "@/components/FormInput";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { Profile, profileScheme } from "@/features/profile";
import { useState } from "react";

interface Props {
  defaultValues?: Profile;
  isUploading: boolean;
  updateProfile: (value: Profile) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<void>;
}

export const ProfileForm = ({
  defaultValues,
  isUploading,
  updateProfile,
  uploadProfilePhoto,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>({
    defaultValues: defaultValues,
    resolver: zodResolver(profileScheme),
  });

  const onSubmit: SubmitHandler<Profile> = async (data) => {
    await updateProfile(data);
  };

  return (
    <VStack>
      <Stack
        w="full"
        align="center"
        gap={9}
        pt={5}
        direction={{ base: "column", md: "row" }}
      >
        <ProfilePhotoUpload
          photoUrl={defaultValues?.picture ?? ""}
          isLoading={isUploading}
          updatePhoto={uploadProfilePhoto}
        />
        <VStack
          w="full"
          bg="white"
          as="form"
          gap={5}
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label="Email"
            readonly
            placeholder="メールアドレスを入力"
            register={register("email")}
            error={errors.email}
          />
          <FormInput
            label="ユーザー名"
            placeholder="ユーザー名を入力"
            register={register("name")}
            error={errors.name}
          />
        </VStack>
      </Stack>
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
