import axiosClient from "@aspida/axios";

import api from "@/api/$api";

export const createClient = (idToken?: string) =>
  api(
    axiosClient(undefined, {
      baseURL: "https://datti-api-dev.fly.dev",
      headers: idToken
        ? {
            Authorization: `Bearer ${idToken}`,
          }
        : undefined,
    })
  );
