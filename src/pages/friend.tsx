import { Container, Grid, GridItem, Heading } from "@chakra-ui/react";
import Head from "next/head";

import type { NextPage } from "next";

import { Friend } from "@/api/datti/@types";
import { FriendList } from "@/components/organisms/FriendList";
import { Header } from "@/components/organisms/Header";

const Friend: NextPage = () => {
  const friends: Friend[] = [];

  return (
    <>
      <Head>
        <title>Datti - フレンド</title>
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
                フレンド
              </Heading>
            </GridItem>
            <GridItem colSpan={12}>
              <FriendList friends={friends} />
            </GridItem>
          </Grid>
        </Container>
      </main>
    </>
  );
};

export default Friend;
