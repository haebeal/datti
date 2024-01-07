import { BankAccountForm } from "@/components/BankAccountForm";
import { ProfileForm } from "@/components/ProfileForm";
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
  updateProfile: () => Promise<void>;
  updateBankAccount: () => Promise<void>;
}

export const Settings = ({ updateProfile, updateBankAccount }: Props) => {
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
              <ProfileForm onSubmit={updateProfile} />
            </TabPanel>
            <TabPanel>
              <BankAccountForm onSubmit={updateBankAccount} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};
