import { Settings } from "@/components/Settings";
import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

const SettingsPage = () => {
  const updateProfile = async () => {};
  const updateBankAccount = async () => {};

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
          <GridItem>
            <Heading size="lg" textAlign="center" mt={10}>
              設定
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
