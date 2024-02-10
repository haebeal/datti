import type { Methods as Methods_on2dq4 } from "./bank";
import type { AspidaClient, BasicHeaders } from "aspida";

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (
    baseURL === undefined ? "https://datti-api-prod.fly.dev" : baseURL
  ).replace(/\/$/, "");
  const PATH0 = "/bank";
  const GET = "GET";
  const POST = "POST";
  const DELETE = "DELETE";

  return {
    bank: {
      /**
       * 口座情報情報の登録
       * @returns 正常処理のレスポンス
       */
      post: (option: {
        body: Methods_on2dq4["post"]["reqBody"];
        config?: T | undefined;
      }) =>
        fetch<
          Methods_on2dq4["post"]["resBody"],
          BasicHeaders,
          Methods_on2dq4["post"]["status"]
        >(prefix, PATH0, POST, option).json(),
      /**
       * 口座情報情報の登録
       * @returns 正常処理のレスポンス
       */
      $post: (option: {
        body: Methods_on2dq4["post"]["reqBody"];
        config?: T | undefined;
      }) =>
        fetch<
          Methods_on2dq4["post"]["resBody"],
          BasicHeaders,
          Methods_on2dq4["post"]["status"]
        >(prefix, PATH0, POST, option)
          .json()
          .then((r) => r.body),
      /**
       * 口座情報情報の参照
       * @returns 正常処理のレスポンス
       */
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<
          Methods_on2dq4["get"]["resBody"],
          BasicHeaders,
          Methods_on2dq4["get"]["status"]
        >(prefix, PATH0, GET, option).json(),
      /**
       * 口座情報情報の参照
       * @returns 正常処理のレスポンス
       */
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<
          Methods_on2dq4["get"]["resBody"],
          BasicHeaders,
          Methods_on2dq4["get"]["status"]
        >(prefix, PATH0, GET, option)
          .json()
          .then((r) => r.body),
      /**
       * 口座情報情報の削除
       * @returns 正常処理のレスポンス
       */
      delete: (option?: { config?: T | undefined } | undefined) =>
        fetch<
          Methods_on2dq4["delete"]["resBody"],
          BasicHeaders,
          Methods_on2dq4["delete"]["status"]
        >(prefix, PATH0, DELETE, option).json(),
      /**
       * 口座情報情報の削除
       * @returns 正常処理のレスポンス
       */
      $delete: (option?: { config?: T | undefined } | undefined) =>
        fetch<
          Methods_on2dq4["delete"]["resBody"],
          BasicHeaders,
          Methods_on2dq4["delete"]["status"]
        >(prefix, PATH0, DELETE, option)
          .json()
          .then((r) => r.body),
      $path: () => `${prefix}${PATH0}`,
    },
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
