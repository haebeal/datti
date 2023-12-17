import {
  Button,
  Center,
  Grid,
  GridItem,
  Heading,
  Stack,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";

export const getStaticProps = async () => {
  return {
    props: {
      layout: "top",
    },
  };
};

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
            <Stack direction="column" pt={180} gap={4} color="white">
              <Heading size="4xl">Hello Datti!</Heading>
              <Heading size="lg">誰にいくら払ったっけ？</Heading>
              <Heading size="lg">を記録するアプリ</Heading>
            </Stack>
          </GridItem>
          <GridItem colSpan={12}>
            <Center pt={120}>
              <Button
                colorScheme="facebook"
                size="lg"
                as={Link}
                href="/dashboard"
              >
                はじめる
              </Button>
            </Center>
          </GridItem>
        </Grid>
      </main>
    </>
  );
};

export default Home;
