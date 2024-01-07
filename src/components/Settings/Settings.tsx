import { BankAccountForm } from "@/components/BankAccountForm";
import { ProfileForm } from "@/components/ProfileForm";
import { Profile } from "@/features/profile";
import {
  Card,
  CardBody,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";

interface Props {
  profile?: Profile;
  updateProfile: () => Promise<void>;
  updateBankAccount: () => Promise<void>;
}

export const Settings = ({
  profile,
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
            </TabPanel>
            <TabPanel>
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
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};
