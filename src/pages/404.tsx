import { NotFound } from "@/components/NotFound";
import { Center } from "@chakra-ui/react";
import { NextPage } from "next";
import Head from "next/head";

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Datti - Not Found</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center h="80vh">
        <NotFound />
      </Center>
    </>
  );
};

export default NotFoundPage;
