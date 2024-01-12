import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

import { Settings } from "@/components/Settings";
import { useProfile } from "@/hooks/useProfile";

const SettingsPage = () => {
  const { profile, isLoading, update } = useProfile();

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
              設定
            </Heading>
          </GridItem>
          <GridItem colSpan={12}>
            <Settings
              isLoading={isLoading}
              profile={profile}
              updateProfile={update}
            />
          </GridItem>
        </Grid>
      </main>
    </>
  );
};

export default SettingsPage;
