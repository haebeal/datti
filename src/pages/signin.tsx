import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import Head from "next/head";
import { signIn } from "next-auth/react";

const SignIn = () => {
  const onClickSigninWithGoogle = () => {
    signIn("google", {
      redirect: true,
      callbackUrl: "/dashboard",
    });
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
        <Container>
          <Center minH="calc(70vh - 80px)">
            <Box
              gap={4}
              minW="75%"
              w="900px"
              bg="white"
              rounded="lg"
              px={14}
              py={10}
            >
              <VStack gap={5}>
                <Heading size="xl">Datti</Heading>
                <Text textAlign="center">
                  誰にいくら払ったっけ？
                  <br />
                  を記録するアプリ
                </Text>
                <Divider />
                <Button
                  minW="80%"
                  colorScheme="twitter"
                  onClick={onClickSigninWithGoogle}
                >
                  Googleでログイン
                </Button>
              </VStack>
            </Box>
          </Center>
        </Container>
      </main>
    </>
  );
};

export default SignIn;
