import axiosClient from "@aspida/axios";

export const createClient = (idToken?: string) =>
  axiosClient(undefined, {
    baseURL: "https://datti-api-dev.fly.dev",
    headers: idToken
      ? {
          Authorization: `Bearer ${idToken}`,
        }
      : undefined,
  });
