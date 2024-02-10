import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

import type { NextPageWithLayout } from "next";

import { DefaultLayout } from "@/layouts";

const Home: NextPageWithLayout = () => (
  <>
    <Head>
      <title>Datti - ダッシュボード</title>
      <meta name="description" content="Datti Web" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <Grid templateColumns="repeat(12, 1fr)" gap={5}>
        <GridItem colSpan={12}>
          <Heading size="lg" mt={10}>
            ダッシュボード
          </Heading>
        </GridItem>
      </Grid>
    </main>
  </>
);

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

export default Home;
