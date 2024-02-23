import axiosClient from "@aspida/axios";

import banksApi from "@/api/banks/$api";
import dattiApi from "@/api/datti/$api";

export const createDattiClient = (idToken: string) =>
  dattiApi(
    axiosClient(undefined, {
      baseURL: process.env.NEXT_PUBLIC_BACKEND_ENDPOINT,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
  );

export const createBanksClient = () => banksApi(axiosClient());
