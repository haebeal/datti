import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Link,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import type { Bank } from "@/api/datti/@types";
import type { NextPage } from "next";
import type { SubmitHandler } from "react-hook-form";

import { useProfile } from "@/hooks";

import { BankForm } from "@/components/organisms/BankForm";
import { Header } from "@/components/organisms/Header";

const BankSetting: NextPage = () => {
  const { data: session, status } = useSession();
  const { isLoading, bank, fetchBank, updateBank, deleteBank } = useProfile();

  useEffect(() => {
    if (status === "authenticated") {
      fetchBank(session.idToken);
    }
  }, [status]);

  const onSubmit: SubmitHandler<Bank> = async (data) => {
    if (session?.idToken) {
      await updateBank(session.idToken, data);
    }
  };

  const onDelete = async () => {
    if (session?.idToken) {
      await deleteBank(session.idToken);
    }
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
        <Header />
        <Container maxW="container.xl" p={10}>
          <Card>
            <Tabs index={1}>
              <CardHeader>
                <TabList>
                  <Tab as={Link} href="/settings/profile">
                    <Heading size="sm">プロフィール</Heading>
                  </Tab>
                  <Tab as={Link} href="/settings/bank">
                    <Heading size="sm">振込先口座</Heading>
                  </Tab>
                </TabList>
              </CardHeader>
              <CardBody>
                <TabPanels>
                  <TabPanel />
                  <TabPanel>
                    <Skeleton
                      isLoaded={
                        status === "authenticated" &&
                        bank !== undefined &&
                        !isLoading
                      }
                    >
                      <BankForm
                        defaultValues={bank}
                        onSubmit={onSubmit}
                        onDelete={onDelete}
                      />
                    </Skeleton>
                  </TabPanel>
                </TabPanels>
              </CardBody>
            </Tabs>
          </Card>
        </Container>
      </main>
    </>
  );
};

export default BankSetting;
