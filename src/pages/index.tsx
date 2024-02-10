import { Button, Grid, GridItem, Heading, VStack } from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";

const Home = () => (
  <>
    <Head>
      <title>Datti</title>
      <meta name="description" content="Datti Web" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main>
      <Grid templateColumns="repeat(12, 1fr)" minH="100vh" bg="blue.400">
        <GridItem colSpan={12}>
          <VStack direction="column" pt={180} gap={8} color="white">
            <Heading size="4xl">Hello Datti!</Heading>
            <Heading size="lg">誰にいくら払ったっけ？を記録するアプリ</Heading>
            <Button
              colorScheme="facebook"
              size="lg"
              as={Link}
              href="/dashboard"
            >
              はじめる
            </Button>
          </VStack>
        </GridItem>
      </Grid>
    </main>
  </>
);

export default Home;
