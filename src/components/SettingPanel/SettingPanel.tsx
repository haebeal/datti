import {
  Card,
  CardBody,
  Divider,
  Skeleton,
  Stack,
  VStack,
} from "@chakra-ui/react";

import { profileSchema } from "@/schema";

import { BankAccountForm } from "@/components/BankAccountForm";
import { ProfileForm } from "@/components/ProfileForm";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { useBankAccount } from "@/hooks/useBankAccount";
import { useFirebase } from "@/hooks/useFirebase";

export const SettingPanel = () => {
  const {
    isLoading: isLoadingProfile,
    isUploading,
    currentUser,
    updateProfile,
    uploadProfilePhoto,
  } = useFirebase();
  const {
    isLoading: isLoadingBankAccount,
    bankAccount,
    updateBankAccount,
    deleteBankAccount,
    reloadBankAccount,
  } = useBankAccount();

  return (
    <Card mb={8}>
      <CardBody>
        <Stack
          w="full"
          align={{ base: "center", md: "start" }}
          gap={9}
          pt={5}
          direction={{ base: "column", md: "row" }}
        >
          <ProfilePhotoUpload
            photoUrl={currentUser?.photoURL ?? ""}
            isLoading={isUploading}
            updatePhoto={uploadProfilePhoto}
          />
          <VStack gap={5} w="full">
            <Skeleton isLoaded={!isLoadingProfile} w="full">
              <ProfileForm
                isUploading={isUploading}
                uploadProfilePhoto={uploadProfilePhoto}
                defaultValues={
                  currentUser ? profileSchema.parse(currentUser) : undefined
                }
                updateProfile={updateProfile}
              />
            </Skeleton>
            <Divider />
            <Skeleton
              isLoaded={!isLoadingProfile && !isLoadingBankAccount}
              w="full"
            >
              <BankAccountForm
                defaultValues={bankAccount}
                updateBankAccount={updateBankAccount}
                deleteBankAccount={deleteBankAccount}
                reloadBankAccount={reloadBankAccount}
              />
            </Skeleton>
          </VStack>
        </Stack>
      </CardBody>
    </Card>
  );
};
