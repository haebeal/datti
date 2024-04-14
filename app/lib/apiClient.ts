import fetchClient from "@aspida/fetch";

import banksApi from "~/api/banks/$api";
import dattiApi from "~/api/datti/$api";

export const createDattiClient = (idToken: string, baseURL: string) =>
  dattiApi(
    fetchClient(undefined, {
      baseURL,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
  );

export const createBanksClient = () => banksApi(fetchClient());
