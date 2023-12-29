import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

const Home = () => {
  return (
    <>
      <Head>
        <title>Datti</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Grid templateColumns="repeat(12, 1fr)">
          <GridItem colSpan={12}>
            <Heading size="lg" mt={10}>
              ダッシュボード
            </Heading>
          </GridItem>
        </Grid>
      </main>
    </>
  );
};

export default Home;
