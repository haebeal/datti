import {
  Card,
  CardBody,
  Heading,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import { BankAccountForm } from "@/components/BankAccountForm";
import { ProfileForm } from "@/components/ProfileForm";
import { useBankAccount } from "@/hooks/useBankAccount";
import { useProfile } from "@/hooks/useProfile";

export const SettingPanel = () => {
  const { isLoading: isLoadingProfile, profile, updateProfile } = useProfile();
  const {
    isLoading: isLoadingBankAccount,
    bankAccount,
    updateBankAccount,
  } = useBankAccount();

  return (
    <Card>
      <CardBody>
        <Tabs>
          <TabList>
            <Tab>
              <Heading size="sm">プロフィール</Heading>
            </Tab>
            <Tab>
              <Heading size="sm">振込先口座</Heading>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Skeleton isLoaded={!isLoadingProfile}>
                <ProfileForm
                  defaultValues={profile ?? undefined}
                  updateProfile={updateProfile}
                />
              </Skeleton>
            </TabPanel>
            <TabPanel>
              <Skeleton isLoaded={!isLoadingBankAccount}>
                <BankAccountForm
                  defaultValues={bankAccount}
                  updateBankAccount={updateBankAccount}
                />
              </Skeleton>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};
