import { Avatar, Button, HStack, Heading, Spacer } from "@chakra-ui/react";

import type { Friend } from "@/api/datti/@types";

interface Props {
  /**
   * フレンド情報
   */
  friend: Friend;
  /**
   * 承認ボタン押下時に実行
   */
  onClickApply?: (friend: Friend) => void;
  /**
   * 解除、却下、申請取り消しボタン押下時に実行
   */
  onClickDeny: (friend: Friend) => void;
}

export const FriendCard = ({ friend, onClickApply, onClickDeny }: Props) => (
  <HStack
    data-testid="friend-card"
    px={5}
    py={5}
    w="full"
    borderWidth="1px"
    borderColor="gray.200"
    bg="white"
    rounded="md"
  >
    <Avatar
      borderWidth={1}
      name={friend.name}
      size={{ base: "md", md: "lg" }}
      borderColor="gray.100"
      src={friend.photoUrl}
    />
    <Heading
      textAlign={{ base: "center", md: "left" }}
      noOfLines={1}
      ps={{ base: undefined, md: 5 }}
      size={{ base: "sm", md: "md" }}
    >
      {friend.name}
    </Heading>
    <Spacer />
    {friend.status === "applied" && onClickApply !== undefined && (
      <Button
        variant="outline"
        colorScheme="green"
        size={{ base: "sm", md: "md" }}
        onClick={() => onClickApply(friend)}
      >
        承認
      </Button>
    )}
    <Button
      onClick={() => onClickDeny(friend)}
      variant={friend.status === "friend" ? "solid" : "outline"}
      colorScheme="red"
      size={{ base: "sm", md: "md" }}
    >
      {friend.status === "friend"
        ? "解除"
        : friend.status === "applied"
          ? "却下"
          : "申請取り消し"}
    </Button>
  </HStack>
);
