import type { AspidaClient, BasicHeaders } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods_on2dq4 } from './bank';
import type { Methods as Methods_143531r } from './friends';
import type { Methods as Methods_18at316 } from './friends/_uid@string';
import type { Methods as Methods_srclc8 } from './friends/pendings';
import type { Methods as Methods_tuwnzq } from './friends/requests';
import type { Methods as Methods_1jtp8e2 } from './groups';
import type { Methods as Methods_1pf0wjb } from './groups/_gid@string/events';
import type { Methods as Methods_2g2ck9 } from './groups/_gid@string/events/_id@string';
import type { Methods as Methods_1ip4i6a } from './groups/_id@string';
import type { Methods as Methods_io26wi } from './groups/_id@string/members';
import type { Methods as Methods_1xhiioa } from './users';
import type { Methods as Methods_1r7npmf } from './users/_uid@string';
import type { Methods as Methods_1niztz2 } from './users/_uid@string/requests';
import type { Methods as Methods_jzr18p } from './users/me';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? 'https://datti-api-dev.fly.dev' : baseURL).replace(/\/$/, '');
  const PATH0 = '/bank';
  const PATH1 = '/friends';
  const PATH2 = '/friends/pendings';
  const PATH3 = '/friends/requests';
  const PATH4 = '/groups';
  const PATH5 = '/events';
  const PATH6 = '/members';
  const PATH7 = '/users';
  const PATH8 = '/requests';
  const PATH9 = '/users/me';
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
      _uid: (val1: string) => {
        const prefix1 = `${PATH1}/${val1}`;

        return {
          /**
           * フレンドの登録解除
           * @returns 200レスポンス
           */
          delete: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_18at316['delete']['resBody'], BasicHeaders, Methods_18at316['delete']['status']>(prefix, prefix1, DELETE, option).json(),
          /**
           * フレンドの登録解除
           * @returns 200レスポンス
           */
          $delete: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_18at316['delete']['resBody'], BasicHeaders, Methods_18at316['delete']['status']>(prefix, prefix1, DELETE, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      pendings: {
        /**
         * フレンド申請未承認のユーザーを取得
         * @returns The request has succeeded.
         */
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_srclc8['get']['resBody'], BasicHeaders, Methods_srclc8['get']['status']>(prefix, PATH2, GET, option).json(),
        /**
         * フレンド申請未承認のユーザーを取得
         * @returns The request has succeeded.
         */
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_srclc8['get']['resBody'], BasicHeaders, Methods_srclc8['get']['status']>(prefix, PATH2, GET, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH2}`,
      },
      requests: {
        /**
         * フレンド申請中のユーザーを取得
         * @returns The request has succeeded.
         */
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_tuwnzq['get']['resBody'], BasicHeaders, Methods_tuwnzq['get']['status']>(prefix, PATH3, GET, option).json(),
        /**
         * フレンド申請中のユーザーを取得
         * @returns The request has succeeded.
         */
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_tuwnzq['get']['resBody'], BasicHeaders, Methods_tuwnzq['get']['status']>(prefix, PATH3, GET, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH3}`,
      },
      /**
       * フレンドのユーザーを取得
       * @returns The request has succeeded.
       */
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_143531r['get']['resBody'], BasicHeaders, Methods_143531r['get']['status']>(prefix, PATH1, GET, option).json(),
      /**
       * フレンドのユーザーを取得
       * @returns The request has succeeded.
       */
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_143531r['get']['resBody'], BasicHeaders, Methods_143531r['get']['status']>(prefix, PATH1, GET, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH1}`,
    },
    groups: {
      _gid: (val1: string) => {
        const prefix1 = `${PATH4}/${val1}`;

        return {
          events: {
            _id: (val3: string) => {
              const prefix3 = `${prefix1}${PATH5}/${val3}`;

              return {
                /**
                 * 登録されているイベント情報の取得
                 * @returns The request has succeeded.
                 */
                get: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_2g2ck9['get']['resBody'], BasicHeaders, Methods_2g2ck9['get']['status']>(prefix, prefix3, GET, option).json(),
                /**
                 * 登録されているイベント情報の取得
                 * @returns The request has succeeded.
                 */
                $get: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_2g2ck9['get']['resBody'], BasicHeaders, Methods_2g2ck9['get']['status']>(prefix, prefix3, GET, option).json().then(r => r.body),
                /**
                 * イベント情報の更新
                 * @returns The request has succeeded.
                 */
                put: (option: { body: Methods_2g2ck9['put']['reqBody'], config?: T | undefined }) =>
                  fetch<Methods_2g2ck9['put']['resBody'], BasicHeaders, Methods_2g2ck9['put']['status']>(prefix, prefix3, PUT, option).json(),
                /**
                 * イベント情報の更新
                 * @returns The request has succeeded.
                 */
                $put: (option: { body: Methods_2g2ck9['put']['reqBody'], config?: T | undefined }) =>
                  fetch<Methods_2g2ck9['put']['resBody'], BasicHeaders, Methods_2g2ck9['put']['status']>(prefix, prefix3, PUT, option).json().then(r => r.body),
                /**
                 * イベント情報の削除
                 * @returns 200レスポンス
                 */
                delete: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_2g2ck9['delete']['resBody'], BasicHeaders, Methods_2g2ck9['delete']['status']>(prefix, prefix3, DELETE, option).json(),
                /**
                 * イベント情報の削除
                 * @returns 200レスポンス
                 */
                $delete: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_2g2ck9['delete']['resBody'], BasicHeaders, Methods_2g2ck9['delete']['status']>(prefix, prefix3, DELETE, option).json().then(r => r.body),
                $path: () => `${prefix}${prefix3}`,
              };
            },
            /**
             * グループIDに紐づくイベント情報の取得
             * @returns The request has succeeded.
             */
            get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_1pf0wjb['get']['resBody'], BasicHeaders, Methods_1pf0wjb['get']['status']>(prefix, `${prefix1}${PATH5}`, GET, option).json(),
            /**
             * グループIDに紐づくイベント情報の取得
             * @returns The request has succeeded.
             */
            $get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_1pf0wjb['get']['resBody'], BasicHeaders, Methods_1pf0wjb['get']['status']>(prefix, `${prefix1}${PATH5}`, GET, option).json().then(r => r.body),
            /**
             * イベント情報の登録
             * @returns The request has succeeded.
             */
            post: (option: { body: Methods_1pf0wjb['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_1pf0wjb['post']['resBody'], BasicHeaders, Methods_1pf0wjb['post']['status']>(prefix, `${prefix1}${PATH5}`, POST, option).json(),
            /**
             * イベント情報の登録
             * @returns The request has succeeded.
             */
            $post: (option: { body: Methods_1pf0wjb['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_1pf0wjb['post']['resBody'], BasicHeaders, Methods_1pf0wjb['post']['status']>(prefix, `${prefix1}${PATH5}`, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix1}${PATH5}`,
          },
        };
      },
      _id: (val1: string) => {
        const prefix1 = `${PATH4}/${val1}`;

        return {
          members: {
            /**
             * グループに対するメンバーの追加
             * @returns The request has succeeded.
             */
            post: (option: { body: Methods_io26wi['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_io26wi['post']['resBody'], BasicHeaders, Methods_io26wi['post']['status']>(prefix, `${prefix1}${PATH6}`, POST, option).json(),
            /**
             * グループに対するメンバーの追加
             * @returns The request has succeeded.
             */
            $post: (option: { body: Methods_io26wi['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_io26wi['post']['resBody'], BasicHeaders, Methods_io26wi['post']['status']>(prefix, `${prefix1}${PATH6}`, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix1}${PATH6}`,
          },
          /**
           * グループ情報の取得
           * @returns The request has succeeded.
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1ip4i6a['get']['resBody'], BasicHeaders, Methods_1ip4i6a['get']['status']>(prefix, prefix1, GET, option).json(),
          /**
           * グループ情報の取得
           * @returns The request has succeeded.
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1ip4i6a['get']['resBody'], BasicHeaders, Methods_1ip4i6a['get']['status']>(prefix, prefix1, GET, option).json().then(r => r.body),
          /**
           * グループ情報の更新
           * @returns The request has succeeded.
           */
          put: (option: { body: Methods_1ip4i6a['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_1ip4i6a['put']['resBody'], BasicHeaders, Methods_1ip4i6a['put']['status']>(prefix, prefix1, PUT, option).json(),
          /**
           * グループ情報の更新
           * @returns The request has succeeded.
           */
          $put: (option: { body: Methods_1ip4i6a['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_1ip4i6a['put']['resBody'], BasicHeaders, Methods_1ip4i6a['put']['status']>(prefix, prefix1, PUT, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      /**
       * 所属しているグループの取得
       * @returns The request has succeeded.
       */
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1jtp8e2['get']['resBody'], BasicHeaders, Methods_1jtp8e2['get']['status']>(prefix, PATH4, GET, option).json(),
      /**
       * 所属しているグループの取得
       * @returns The request has succeeded.
       */
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1jtp8e2['get']['resBody'], BasicHeaders, Methods_1jtp8e2['get']['status']>(prefix, PATH4, GET, option).json().then(r => r.body),
      /**
       * グループの作成
       * @returns The request has succeeded.
       */
      post: (option: { body: Methods_1jtp8e2['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1jtp8e2['post']['resBody'], BasicHeaders, Methods_1jtp8e2['post']['status']>(prefix, PATH4, POST, option).json(),
      /**
       * グループの作成
       * @returns The request has succeeded.
       */
      $post: (option: { body: Methods_1jtp8e2['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1jtp8e2['post']['resBody'], BasicHeaders, Methods_1jtp8e2['post']['status']>(prefix, PATH4, POST, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH4}`,
    },
    users: {
      _uid: (val1: string) => {
        const prefix1 = `${PATH7}/${val1}`;

        return {
          requests: {
            /**
             * フレンド申請の送信
             * @returns 201レスポンス
             */
            post: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_1niztz2['post']['resBody'], BasicHeaders, Methods_1niztz2['post']['status']>(prefix, `${prefix1}${PATH8}`, POST, option).json(),
            /**
             * フレンド申請の送信
             * @returns 201レスポンス
             */
            $post: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_1niztz2['post']['resBody'], BasicHeaders, Methods_1niztz2['post']['status']>(prefix, `${prefix1}${PATH8}`, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix1}${PATH8}`,
          },
          /**
           * プロフィール情報の取得
           * @returns The request has succeeded.
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1r7npmf['get']['resBody'], BasicHeaders, Methods_1r7npmf['get']['status']>(prefix, prefix1, GET, option).json(),
          /**
           * プロフィール情報の取得
           * @returns The request has succeeded.
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_1r7npmf['get']['resBody'], BasicHeaders, Methods_1r7npmf['get']['status']>(prefix, prefix1, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      me: {
        /**
         * ユーザー情報の取得
         * @returns The request has succeeded.
         */
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_jzr18p['get']['resBody'], BasicHeaders, Methods_jzr18p['get']['status']>(prefix, PATH9, GET, option).json(),
        /**
         * ユーザー情報の取得
         * @returns The request has succeeded.
         */
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_jzr18p['get']['resBody'], BasicHeaders, Methods_jzr18p['get']['status']>(prefix, PATH9, GET, option).json().then(r => r.body),
        /**
         * ユーザー情報の更新
         * @returns The request has succeeded.
         */
        put: (option: { body: Methods_jzr18p['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_jzr18p['put']['resBody'], BasicHeaders, Methods_jzr18p['put']['status']>(prefix, PATH9, PUT, option).json(),
        /**
         * ユーザー情報の更新
         * @returns The request has succeeded.
         */
        $put: (option: { body: Methods_jzr18p['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_jzr18p['put']['resBody'], BasicHeaders, Methods_jzr18p['put']['status']>(prefix, PATH9, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH9}`,
      },
      /**
       * メールアドレスによるユーザー情報の取得
       * @returns The request has succeeded.
       */
      get: (option?: { query?: Methods_1xhiioa['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody'], BasicHeaders, Methods_1xhiioa['get']['status']>(prefix, PATH7, GET, option).json(),
      /**
       * メールアドレスによるユーザー情報の取得
       * @returns The request has succeeded.
       */
      $get: (option?: { query?: Methods_1xhiioa['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody'], BasicHeaders, Methods_1xhiioa['get']['status']>(prefix, PATH7, GET, option).json().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_1xhiioa['get']['query'] } | undefined) =>
        `${prefix}${PATH7}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
