import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

import type { NextPageWithLayout } from "next";

import { DefaultLayout } from "@/layouts";

import { SettingPanel } from "@/components/SettingPanel";

const SettingPage: NextPageWithLayout = () => (
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
          <SettingPanel />
        </GridItem>
      </Grid>
    </main>
  </>
);

SettingPage.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

export default SettingPage;
