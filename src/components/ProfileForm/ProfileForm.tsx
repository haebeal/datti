import { Button, Stack, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { Profile, profileSchema } from "@/schema";

interface Props {
  defaultValues?: Profile;
  isUploading: boolean;
  updateProfile: (value: Profile) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<void>;
}

export const ProfileForm = ({ defaultValues, updateProfile }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>({
    defaultValues: defaultValues,
    resolver: zodResolver(profileSchema),
  });

  const onSubmit: SubmitHandler<Profile> = async (data) => {
    await updateProfile(data);
  };

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack
        w="full"
        align="center"
        gap={9}
        pt={5}
        direction={{ base: "column", md: "row" }}
      >
        <VStack w="full" bg="white" gap={5}>
          <FormInput
            label="ユーザー名"
            placeholder="ユーザー名を入力"
            register={register("displayName")}
            error={errors.displayName}
          />
        </VStack>
      </Stack>
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
