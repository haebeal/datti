import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

import { Settings } from "@/components/Settings";
import { useProfile } from "@/hooks/useProfile";

const SettingsPage = () => {
  const updateProfile = async () => {};
  const updateBankAccount = async () => {};

  const { profile } = useProfile();

  return (
    <>
      <Head>
        <title>Datti - 設定</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Grid templateColumns="repeat(12, 1fr)" gap={5}>
          <GridItem colSpan={12}>
            <Heading size="lg" mt={10}>
              {profile && `${profile.name}さんの`}設定
            </Heading>
          </GridItem>
          <GridItem colSpan={12}>
            <Settings
              updateProfile={updateProfile}
              updateBankAccount={updateBankAccount}
            />
          </GridItem>
        </Grid>
      </main>
    </>
  );
};

export default SettingsPage;
