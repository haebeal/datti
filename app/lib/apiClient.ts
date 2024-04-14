import axiosClient from "@aspida/axios";

import banksApi from "~/api/banks/$api";
import dattiApi from "~/api/datti/$api";

export const createDattiClient = (idToken: string, baseURL: string) =>
  dattiApi(
    axiosClient(undefined, {
      baseURL,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
  );

export const createBanksClient = () => banksApi(axiosClient());
