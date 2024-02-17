import { Container, Grid, GridItem, Heading, Skeleton } from "@chakra-ui/react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import type { Profile } from "@/api/datti/@types";
import type { NextPage } from "next";
import type { SubmitHandler } from "react-hook-form";

import { useProfile } from "@/hooks";

import { Header } from "@/components/Header";
import { ProfileForm } from "@/components/ProfileForm";

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
        <Container maxW="container.xl">
          <Grid templateColumns="repeat(12, 1fr)" gap={5}>
            <GridItem colSpan={12}>
              <Heading size="lg" mt={10}>
                プロフィール設定
              </Heading>
            </GridItem>
            <GridItem colSpan={12}>
              <Skeleton
                isLoaded={
                  status === "authenticated" &&
                  profile !== undefined &&
                  !isLoading
                }
              >
                <ProfileForm defaultValues={profile} onSubmit={onSubmit} />
              </Skeleton>
            </GridItem>
          </Grid>
        </Container>
      </main>
    </>
  );
};

export default ProfileSetting;
