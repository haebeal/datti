import axiosClient from "@aspida/axios";

import banksApi from "@/api/banks/$api";
import dattiApi from "@/api/datti/$api";

export const createDattiClient = (idToken: string) =>
  dattiApi(
    axiosClient(undefined, {
      baseURL: "https://datti-api-dev.fly.dev",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
  );

export const createBanksClient = () => banksApi(axiosClient());
