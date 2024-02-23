import { Container, Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

import type { NextPage } from "next";

import { Header } from "@/components/organisms/Header";

const Home: NextPage = () => (
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
              ダッシュボード
            </Heading>
          </GridItem>
        </Grid>
      </Container>
    </main>
  </>
);

export default Home;
