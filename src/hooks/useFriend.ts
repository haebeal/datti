import { useState } from "react";

import type { Friend } from "@/api/datti/@types";

import { createDattiClient } from "@/utils";

export const useFriend = () => {
  const [isLoading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriends = async (idToken: string) => {
    setLoading(true);
    const client = createDattiClient(idToken);
    const response = await client.friends.$get();
    setFriends(response);
    setLoading(false);
  };

  return {
    isLoading,
    friends,
    fetchFriends,
  };
};
