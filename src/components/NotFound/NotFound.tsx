import { Heading, Link, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

export const NotFound = () => {
  return (
    <VStack gap={4}>
      <Heading size="xl">404 Not Found</Heading>
      <Heading size="lg">このURLは存在しません</Heading>
      <Link color="teal.500" as={NextLink} href="/">
        <Heading size="md">ホームへ</Heading>
      </Link>
    </VStack>
  );
};
