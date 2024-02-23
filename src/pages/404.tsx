import { Center } from "@chakra-ui/react";
import Head from "next/head";

import type { NextPage } from "next";

import { NotFound } from "@/components/templates/NotFound";

const NotFoundPage: NextPage = () => (
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

export default NotFoundPage;
