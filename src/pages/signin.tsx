import { GetStaticProps } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      layout: "top",
    },
  };
};

export const Signin = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      signIn("google", {
        callbackUrl: "/dashboard",
      });
    } else if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>リダイレクト</title>
        <meta name="description" content="Datti Web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  );
};

export default Signin;
