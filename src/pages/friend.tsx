import { Container, Grid, GridItem, Heading, Skeleton } from "@chakra-ui/react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import type { NextPage } from "next";

import { useFriend } from "@/hooks";

import { FriendList } from "@/components/organisms/FriendList";
import { Header } from "@/components/organisms/Header";

const Friend: NextPage = () => {
  const { data: session, status } = useSession();
  const { isLoading, friends, fetchFriends } = useFriend();

  useEffect(() => {
    if (status === "authenticated") {
      fetchFriends(session.idToken);
    }
  }, [status]);

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
              <Skeleton
                isLoaded={
                  status === "authenticated" &&
                  friends !== undefined &&
                  !isLoading
                }
              >
                <FriendList friends={friends} />
              </Skeleton>
            </GridItem>
          </Grid>
        </Container>
      </main>
    </>
  );
};

export default Friend;
