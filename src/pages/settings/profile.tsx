import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import type { Profile } from "@/api/datti/@types";
import type { NextPage } from "next";
import type { SubmitHandler } from "react-hook-form";

import { useProfile } from "@/hooks";

import { Header } from "@/components/organisms/Header";
import { ProfileForm } from "@/components/organisms/ProfileForm";

const ProfileSetting: NextPage = () => {
  const { data: session, status } = useSession();
  const { isLoading, profile, fetchProfile, updateProfile } = useProfile();

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile(session.idToken);
    }
  }, [status]);

  const onSubmit: SubmitHandler<Profile> = async (data) => {
    if (session?.idToken) {
      await updateProfile(session.idToken, data);
    }
  };

  return (
    <>
      <Head>
        <title>Datti - ダッシュボード</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Container maxW="container.xl" p={10}>
          <Card>
            <Tabs index={0}>
              <CardHeader>
                <TabList>
                  <Tab as={Link} href="/settings/profile">
                    <Heading size="sm">プロフィール</Heading>
                  </Tab>
                  <Tab as={Link} href="/settings/bank">
                    <Heading size="sm">振込先口座</Heading>
                  </Tab>
                </TabList>
              </CardHeader>
              <CardBody>
                <TabPanels>
                  <TabPanel>
                    <Skeleton
                      isLoaded={
                        status === "authenticated" &&
                        profile !== undefined &&
                        !isLoading
                      }
                    >
                      <ProfileForm
                        defaultValues={profile}
                        onSubmit={onSubmit}
                      />
                    </Skeleton>
                  </TabPanel>
                </TabPanels>
              </CardBody>
            </Tabs>
          </Card>
        </Container>
      </main>
    </>
  );
};

export default ProfileSetting;
