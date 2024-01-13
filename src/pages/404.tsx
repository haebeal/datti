import { Center, Heading, Link, VStack } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";

const NotFound: NextPage = () => {
  return (
    <>
      <Head>
        <title>Datti - Not Found</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center minH="80vh">
        <VStack gap={4}>
          <Heading size="xl">404 Not Found</Heading>
          <Heading size="lg">このURLは存在しません</Heading>
          <Link color="teal.500" as={NextLink} href="/">
            <Heading size="md">ホームへ</Heading>
          </Link>
        </VStack>
      </Center>
    </>
  );
};

export default NotFound;
