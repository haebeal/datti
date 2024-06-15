import fetchClient from "@aspida/fetch";
import api from "~/api/$api";

export const createClient = (idToken: string, baseURL: string) =>
  api(
    fetchClient(undefined, {
      baseURL,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
  );
