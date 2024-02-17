import {
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Profile } from "@/api/datti/@types";
import type { SubmitHandler } from "react-hook-form";

import { profileSchema } from "@/schema";

import { FormInput } from "@/components/FormInput";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";

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
    <Card as="form" onSubmit={handleSubmit(onSubmit)}>
      <CardBody p={10}>
        <Grid templateColumns="repeat(12, 1fr)" gap={5}>
          <GridItem colSpan={2}>
            <ProfilePhotoUpload photoUrl={defaultValues?.photoUrl} />
          </GridItem>
          <GridItem colSpan={10}>
            <VStack w="full" gap={5}>
              <FormInput
                label="ユーザー名"
                placeholder="ユーザー名を入力"
                register={register("name")}
                error={errors.name}
              />
              <Button mt={5} minW="30%" type="submit" colorScheme="twitter">
                更新
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};
