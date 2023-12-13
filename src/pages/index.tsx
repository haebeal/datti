import { Heading } from "@chakra-ui/react";
import Head from "next/head";

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
        <Heading>Hello Datti!</Heading>
      </main>
    </>
  );
};

export default Home;
