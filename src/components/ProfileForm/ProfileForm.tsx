import { Button, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { FormInput } from "@/components/FormInput";
import { profileScheme } from "@/features/profile";

export interface ProfileFormProps {
  email: string;
  name: string;
  photoUrl: string;
}

const formSchema = profileScheme.pick({
  email: true,
  name: true,
  photoUrl: true,
});
type FormSchemaType = z.infer<typeof formSchema>;

interface Props {
  defaultValues?: FormSchemaType;
  onSubmit: SubmitHandler<FormSchemaType>;
}

export const ProfileForm = ({ defaultValues, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchemaType>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

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
        register={register("photoUrl")}
        error={errors.photoUrl}
      />
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
