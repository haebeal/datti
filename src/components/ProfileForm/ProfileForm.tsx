import { FormInput } from "@/components/FormInput";
import { Button, Input, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

interface FormProps {
  email: string;
  name: string;
  photoUrl: string;
}

interface Props {
  defaultValues?: FormProps;
  onSubmit: () => Promise<void>;
}

export const ProfileForm = ({ defaultValues, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormProps>({
    defaultValues,
  });

  return (
    <VStack
      bg="white"
      as="form"
      px={10}
      mt={5}
      gap={5}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input {...register("email")} />
      <FormInput
        label="Email"
        readonly
        placeholder="メールアドレスを入力"
        register={register("email")}
        type="email"
        error={errors.email}
      />
      <FormInput
        label="ユーザー名"
        placeholder="ユーザー名を入力"
        register={register("name")}
        type="text"
        error={errors.name}
      />
      <FormInput
        label="プロフィール画像"
        placeholder="画像のURLを入力"
        register={register("photoUrl")}
        type="url"
        error={errors.photoUrl}
      />
      <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
        更新
      </Button>
    </VStack>
  );
};
