import { Button, Skeleton, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { FormInput } from "@/components/FormInput";
import { Profile, profileScheme } from "@/features/profile";

interface Props {
  defaultValues?: Profile;
  updateProfile: (value: Partial<Profile>) => Promise<Profile | null>;
}

export const ProfileForm = ({ defaultValues, updateProfile }: Props) => {
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
    <VStack
      bg="white"
      as="form"
      mt={5}
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
      <FormInput
        label="プロフィール画像"
        placeholder="画像のURLを入力"
        register={register("picture")}
        error={errors.picture}
      />
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
