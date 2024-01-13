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

import { ProfileForm } from "@/components/ProfileForm";
import { useProfile } from "@/hooks/useProfile";

export const SettingPanel = () => {
  const { isLoading: isLoadingProfile, profile, updateProfile } = useProfile();

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
                  defaultValues={profile}
                  updateProfile={updateProfile}
                />
              </Skeleton>
            </TabPanel>
            <TabPanel>
              <div />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};
