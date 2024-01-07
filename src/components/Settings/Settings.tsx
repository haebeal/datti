import { BankAccountForm } from "@/components/BankAccountForm";
import { ProfileForm } from "@/components/ProfileForm";
import { Profile } from "@/features/profile";
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

interface Props {
  profile?: Profile;
  isLoading: boolean;
  updateProfile: () => Promise<void>;
  updateBankAccount: () => Promise<void>;
}

export const Settings = ({
  profile,
  isLoading,
  updateProfile,
  updateBankAccount,
}: Props) => {
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
              <Skeleton isLoaded={!isLoading}>
                <ProfileForm
                  defaultValues={
                    profile && {
                      email: profile.email,
                      name: profile.name,
                      photoUrl: profile.photoUrl,
                    }
                  }
                  onSubmit={updateProfile}
                />
              </Skeleton>
            </TabPanel>
            <TabPanel>
              <Skeleton isLoaded={!isLoading}>
                <BankAccountForm
                  defaultValues={
                    profile && {
                      bankCode: profile.bankCode,
                      branchCode: profile.branchCode,
                      accountCode: profile.accountCode,
                    }
                  }
                  onSubmit={updateBankAccount}
                />
              </Skeleton>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};
