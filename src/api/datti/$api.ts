import type { Methods as Methods_on2dq4 } from './bank';
import type { Methods as Methods_143531r } from './friends';
import type { Methods as Methods_1uc1f5c } from './me';
import type { Methods as Methods_1xhiioa } from './users';
import type { AspidaClient, BasicHeaders } from 'aspida';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/bank';
  const PATH1 = '/friends';
  const PATH2 = '/me';
  const PATH3 = '/users';
  const GET = 'GET';
  const POST = 'POST';
  const PUT = 'PUT';
  const DELETE = 'DELETE';

  return {
    bank: {
      /**
       * 登録されている口座情報の取得
       * @returns 200レスポンス
       */
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_on2dq4['get']['resBody'], BasicHeaders, Methods_on2dq4['get']['status']>(prefix, PATH0, GET, option).json(),
      /**
       * 登録されている口座情報の取得
       * @returns 200レスポンス
       */
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_on2dq4['get']['resBody'], BasicHeaders, Methods_on2dq4['get']['status']>(prefix, PATH0, GET, option).json().then(r => r.body),
      /**
       * 口座情報の登録・更新
       * @returns 201レスポンス
       */
      post: (option: { body: Methods_on2dq4['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_on2dq4['post']['resBody'], BasicHeaders, Methods_on2dq4['post']['status']>(prefix, PATH0, POST, option).json(),
      /**
       * 口座情報の登録・更新
       * @returns 201レスポンス
       */
      $post: (option: { body: Methods_on2dq4['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_on2dq4['post']['resBody'], BasicHeaders, Methods_on2dq4['post']['status']>(prefix, PATH0, POST, option).json().then(r => r.body),
      /**
       * 登録されている口座情報の削除
       * @returns 200レスポンス
       */
      delete: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_on2dq4['delete']['resBody'], BasicHeaders, Methods_on2dq4['delete']['status']>(prefix, PATH0, DELETE, option).json(),
      /**
       * 登録されている口座情報の削除
       * @returns 200レスポンス
       */
      $delete: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_on2dq4['delete']['resBody'], BasicHeaders, Methods_on2dq4['delete']['status']>(prefix, PATH0, DELETE, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH0}`,
    },
    friends: {
      /**
       * フレンド申請の送信
       * @returns The request has succeeded.
       */
      post: (option: { body: Methods_143531r['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_143531r['post']['resBody'], BasicHeaders, Methods_143531r['post']['status']>(prefix, PATH1, POST, option).json(),
      /**
       * フレンド申請の送信
       * @returns The request has succeeded.
       */
      $post: (option: { body: Methods_143531r['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_143531r['post']['resBody'], BasicHeaders, Methods_143531r['post']['status']>(prefix, PATH1, POST, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH1}`,
    },
    me: {
      /**
       * 登録されてるプロフィール情報の取得
       * @returns The request has succeeded.
       */
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1uc1f5c['get']['resBody'], BasicHeaders, Methods_1uc1f5c['get']['status']>(prefix, PATH2, GET, option).json(),
      /**
       * 登録されてるプロフィール情報の取得
       * @returns The request has succeeded.
       */
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1uc1f5c['get']['resBody'], BasicHeaders, Methods_1uc1f5c['get']['status']>(prefix, PATH2, GET, option).json().then(r => r.body),
      /**
       * プロフィール情報の更新
       * @returns The request has succeeded.
       */
      put: (option: { body: Methods_1uc1f5c['put']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1uc1f5c['put']['resBody'], BasicHeaders, Methods_1uc1f5c['put']['status']>(prefix, PATH2, PUT, option).json(),
      /**
       * プロフィール情報の更新
       * @returns The request has succeeded.
       */
      $put: (option: { body: Methods_1uc1f5c['put']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1uc1f5c['put']['resBody'], BasicHeaders, Methods_1uc1f5c['put']['status']>(prefix, PATH2, PUT, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH2}`,
    },
    users: {
      /**
       * メールアドレスによるユーザー情報の取得
       * @returns The request has succeeded.
       */
      get: (option: { body: Methods_1xhiioa['get']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1xhiioa['get']['resBody'], BasicHeaders, Methods_1xhiioa['get']['status']>(prefix, PATH3, GET, option).json(),
      /**
       * メールアドレスによるユーザー情報の取得
       * @returns The request has succeeded.
       */
      $get: (option: { body: Methods_1xhiioa['get']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1xhiioa['get']['resBody'], BasicHeaders, Methods_1xhiioa['get']['status']>(prefix, PATH3, GET, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH3}`,
    },
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
