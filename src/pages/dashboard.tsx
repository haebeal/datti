import {
  Button,
  Grid,
  GridItem,
  HStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import { NextPageWithLayout } from "next";
import Head from "next/head";

import { useAccessToken } from "@/hooks/useAccessToken";
import { DefaultLayout } from "@/layouts";
import { useState } from "react";

const Home: NextPageWithLayout = () => {
  const { getAccessToken } = useAccessToken();
  const [accessToken, setAccessToken] = useState("");

  const onClickGetAccessToken = async () => {
    const result = await getAccessToken();
    setAccessToken(result);
  };

  return (
    <>
      <Head>
        <title>Datti - ダッシュボード</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Grid templateColumns="repeat(12, 1fr)" gap={5}>
          <GridItem colSpan={12}>
            <Heading size="lg" mt={10}>
              ダッシュボード
            </Heading>
            <HStack>
              <Heading size="md">アクセストークン</Heading>
              <Button colorScheme="twitter" onClick={onClickGetAccessToken}>
                取得 / 更新
              </Button>
            </HStack>
            <Text>{accessToken}</Text>
          </GridItem>
        </Grid>
      </main>
    </>
  );
};

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

export default Home;
