import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Grid,
  GridItem,
  Heading,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export const getStaticProps = async () => {
  return {
    props: {
      layout: "top",
    },
  };
};

const Home = () => {
  const toast = useToast();
  const { push } = useRouter();
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  const onClickStart = () => {
    if (isLoading) {
      return toast({
        status: "warning",
        title: "読み込み中です",
      });
    }

    if (isAuthenticated) {
      return push("/dashboard");
    }

    loginWithRedirect();
  };

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
            <VStack direction="column" pt={180} gap={8} color="white">
              <Heading size="4xl">Hello Datti!</Heading>
              <Heading size="lg">
                誰にいくら払ったっけ？を記録するアプリ
              </Heading>
              {!isLoading && (
                <Button colorScheme="facebook" size="lg" onClick={onClickStart}>
                  はじめる
                </Button>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </main>
    </>
  );
};

export default Home;
