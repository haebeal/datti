import { Button, Grid, GridItem, VStack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Profile } from "@/api/datti/@types";
import type { SubmitHandler } from "react-hook-form";

import { profileSchema } from "@/schema";

import { ProfilePhotoUpload } from "@/components/atoms/ProfilePhotoUpload";
import { FormInput } from "@/components/molecules/FormInput";

interface Props {
  defaultValues?: Profile;
  onSubmit: SubmitHandler<Profile>;
}

export const ProfileForm = ({ defaultValues, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>({
    defaultValues: defaultValues,
    resolver: zodResolver(profileSchema),
  });

  return (
    <Grid gap={5} templateColumns="repeat(12, 1fr)">
      <GridItem colSpan={{ base: 12, md: 2 }}>
        <ProfilePhotoUpload photoUrl={defaultValues?.photoUrl} />
      </GridItem>
      <GridItem colSpan={{ base: 12, md: 10 }}>
        <VStack as="form" onSubmit={handleSubmit(onSubmit)} w="full" gap={5}>
          <FormInput
            label="ユーザー名"
            placeholder="ユーザー名を入力"
            {...register("name")}
            error={errors.name?.message}
          />
          <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
            更新
          </Button>
        </VStack>
      </GridItem>
    </Grid>
  );
};
