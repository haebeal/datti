import {
  Button,
  Grid,
  GridItem,
  Heading,
  Stack,
  VStack,
} from "@chakra-ui/react";
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
            <Heading size="4xl">Datti</Heading>
            <Stack align="center">
              <Heading size="lg">誰にいくら払ったっけ？</Heading>
              <Heading size="lg">を記録するアプリ</Heading>
            </Stack>
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
