import {
  Card,
  CardBody,
  CardHeader,
  Center,
  HStack,
  Heading,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { Virtuoso } from "react-virtuoso";

import type { Friend } from "@/api/datti/@types";

import { FriendCard } from "@/components/molecules/FriendCard";

interface Props {
  friends: Friend[];
}

export const FriendList = ({ friends }: Props) => (
  <Card>
    <CardHeader>
      <HStack w="full">
        <Heading size="md">フレンド一覧</Heading>
        <Spacer />
      </HStack>
    </CardHeader>
    <CardBody>
      {friends.length ? (
        <Virtuoso
          style={{ height: "60vh" }}
          data={friends}
          totalCount={friends.length}
          itemContent={(_, friend) => (
            <FriendCard
              friend={friend}
              onClickApply={(friend) => alert(friend.name)}
              onClickDeny={(friend) => alert(friend.name)}
            />
          )}
        />
      ) : (
        <VStack gap={3} h="60vh">
          <Center h="90%">
            <Heading size="md">フレンドが存在しません</Heading>
          </Center>
        </VStack>
      )}
    </CardBody>
  </Card>
);
