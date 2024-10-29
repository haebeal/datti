import type { AspidaClient, BasicHeaders } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods_1jtp8e2 } from './groups';
import type { Methods as Methods_stou6r } from './groups/_groupId@string';
import type { Methods as Methods_103r0fh } from './groups/_groupId@string/events';
import type { Methods as Methods_1bajon9 } from './groups/_groupId@string/events/_eventId@string';
import type { Methods as Methods_1buoxrj } from './groups/_groupId@string/members';
import type { Methods as Methods_1vcka1 } from './payments';
import type { Methods as Methods_tom6tv } from './payments/_paymentId@string';
import type { Methods as Methods_cgieia } from './payments/history';
import type { Methods as Methods_1xhiioa } from './users';
import type { Methods as Methods_pxqx5v } from './users/_userId@string';
import type { Methods as Methods_r0kwp6 } from './users/_userId@string/requests';
import type { Methods as Methods_jcjc85 } from './users/friends/_userId@string';
import type { Methods as Methods_jzr18p } from './users/me';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? 'https://datti-api-dev.fly.dev' : baseURL).replace(/\/$/, '');
  const PATH0 = '/groups';
  const PATH1 = '/events';
  const PATH2 = '/members';
  const PATH3 = '/payments';
  const PATH4 = '/payments/history';
  const PATH5 = '/users';
  const PATH6 = '/requests';
  const PATH7 = '/users/friends';
  const PATH8 = '/users/me';
  const GET = 'GET';
  const POST = 'POST';
  const PUT = 'PUT';
  const DELETE = 'DELETE';

  return {
    groups: {
      _groupId: (val1: string) => {
        const prefix1 = `${PATH0}/${val1}`;

        return {
          events: {
            _eventId: (val3: string) => {
              const prefix3 = `${prefix1}${PATH1}/${val3}`;

              return {
                /**
                 * 登録されているイベント情報の取得
                 * @returns The request has succeeded.
                 */
                get: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_1bajon9['get']['resBody'], BasicHeaders, Methods_1bajon9['get']['status']>(prefix, prefix3, GET, option).json(),
                /**
                 * 登録されているイベント情報の取得
                 * @returns The request has succeeded.
                 */
                $get: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_1bajon9['get']['resBody'], BasicHeaders, Methods_1bajon9['get']['status']>(prefix, prefix3, GET, option).json().then(r => r.body),
                /**
                 * イベント情報の更新
                 * @returns The request has succeeded.
                 */
                put: (option: { body: Methods_1bajon9['put']['reqBody'], config?: T | undefined }) =>
                  fetch<Methods_1bajon9['put']['resBody'], BasicHeaders, Methods_1bajon9['put']['status']>(prefix, prefix3, PUT, option).json(),
                /**
                 * イベント情報の更新
                 * @returns The request has succeeded.
                 */
                $put: (option: { body: Methods_1bajon9['put']['reqBody'], config?: T | undefined }) =>
                  fetch<Methods_1bajon9['put']['resBody'], BasicHeaders, Methods_1bajon9['put']['status']>(prefix, prefix3, PUT, option).json().then(r => r.body),
                /**
                 * イベント情報の削除
                 * @returns 200レスポンス
                 */
                delete: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_1bajon9['delete']['resBody'], BasicHeaders, Methods_1bajon9['delete']['status']>(prefix, prefix3, DELETE, option).json(),
                /**
                 * イベント情報の削除
                 * @returns 200レスポンス
                 */
                $delete: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_1bajon9['delete']['resBody'], BasicHeaders, Methods_1bajon9['delete']['status']>(prefix, prefix3, DELETE, option).json().then(r => r.body),
                $path: () => `${prefix}${prefix3}`,
              };
            },
            /**
             * グループIDに紐づくイベント情報の取得
             * @returns The request has succeeded.
             */
            get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_103r0fh['get']['resBody'], BasicHeaders, Methods_103r0fh['get']['status']>(prefix, `${prefix1}${PATH1}`, GET, option).json(),
            /**
             * グループIDに紐づくイベント情報の取得
             * @returns The request has succeeded.
             */
            $get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_103r0fh['get']['resBody'], BasicHeaders, Methods_103r0fh['get']['status']>(prefix, `${prefix1}${PATH1}`, GET, option).json().then(r => r.body),
            /**
             * イベント情報の登録
             * @returns The request has succeeded.
             */
            post: (option: { body: Methods_103r0fh['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_103r0fh['post']['resBody'], BasicHeaders, Methods_103r0fh['post']['status']>(prefix, `${prefix1}${PATH1}`, POST, option).json(),
            /**
             * イベント情報の登録
             * @returns The request has succeeded.
             */
            $post: (option: { body: Methods_103r0fh['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_103r0fh['post']['resBody'], BasicHeaders, Methods_103r0fh['post']['status']>(prefix, `${prefix1}${PATH1}`, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix1}${PATH1}`,
          },
          members: {
            /**
             * グループに対するメンバー情報の取得
             * @returns The request has succeeded.
             */
            get: (option?: { query?: Methods_1buoxrj['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods_1buoxrj['get']['resBody'], BasicHeaders, Methods_1buoxrj['get']['status']>(prefix, `${prefix1}${PATH2}`, GET, option).json(),
            /**
             * グループに対するメンバー情報の取得
             * @returns The request has succeeded.
             */
            $get: (option?: { query?: Methods_1buoxrj['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods_1buoxrj['get']['resBody'], BasicHeaders, Methods_1buoxrj['get']['status']>(prefix, `${prefix1}${PATH2}`, GET, option).json().then(r => r.body),
            /**
             * グループに対するメンバーの追加
             * @returns The request has succeeded.
             */
            post: (option: { body: Methods_1buoxrj['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_1buoxrj['post']['resBody'], BasicHeaders, Methods_1buoxrj['post']['status']>(prefix, `${prefix1}${PATH2}`, POST, option).json(),
            /**
             * グループに対するメンバーの追加
             * @returns The request has succeeded.
             */
            $post: (option: { body: Methods_1buoxrj['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods_1buoxrj['post']['resBody'], BasicHeaders, Methods_1buoxrj['post']['status']>(prefix, `${prefix1}${PATH2}`, POST, option).json().then(r => r.body),
            $path: (option?: { method?: 'get' | undefined; query: Methods_1buoxrj['get']['query'] } | undefined) =>
              `${prefix}${prefix1}${PATH2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
          },
          /**
           * グループ情報の取得
           * @returns The request has succeeded.
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_stou6r['get']['resBody'], BasicHeaders, Methods_stou6r['get']['status']>(prefix, prefix1, GET, option).json(),
          /**
           * グループ情報の取得
           * @returns The request has succeeded.
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_stou6r['get']['resBody'], BasicHeaders, Methods_stou6r['get']['status']>(prefix, prefix1, GET, option).json().then(r => r.body),
          /**
           * グループ情報の更新
           * @returns The request has succeeded.
           */
          put: (option: { body: Methods_stou6r['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_stou6r['put']['resBody'], BasicHeaders, Methods_stou6r['put']['status']>(prefix, prefix1, PUT, option).json(),
          /**
           * グループ情報の更新
           * @returns The request has succeeded.
           */
          $put: (option: { body: Methods_stou6r['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_stou6r['put']['resBody'], BasicHeaders, Methods_stou6r['put']['status']>(prefix, prefix1, PUT, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      /**
       * 所属しているグループの取得
       * @returns The request has succeeded.
       */
      get: (option?: { query?: Methods_1jtp8e2['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1jtp8e2['get']['resBody'], BasicHeaders, Methods_1jtp8e2['get']['status']>(prefix, PATH0, GET, option).json(),
      /**
       * 所属しているグループの取得
       * @returns The request has succeeded.
       */
      $get: (option?: { query?: Methods_1jtp8e2['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1jtp8e2['get']['resBody'], BasicHeaders, Methods_1jtp8e2['get']['status']>(prefix, PATH0, GET, option).json().then(r => r.body),
      /**
       * グループの作成
       * @returns The request has succeeded.
       */
      post: (option: { body: Methods_1jtp8e2['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1jtp8e2['post']['resBody'], BasicHeaders, Methods_1jtp8e2['post']['status']>(prefix, PATH0, POST, option).json(),
      /**
       * グループの作成
       * @returns The request has succeeded.
       */
      $post: (option: { body: Methods_1jtp8e2['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1jtp8e2['post']['resBody'], BasicHeaders, Methods_1jtp8e2['post']['status']>(prefix, PATH0, POST, option).json().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_1jtp8e2['get']['query'] } | undefined) =>
        `${prefix}${PATH0}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
    payments: {
      _paymentId: (val1: string) => {
        const prefix1 = `${PATH3}/${val1}`;

        return {
          /**
           * 返済情報の取得
           * @returns The request has succeeded.
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_tom6tv['get']['resBody'], BasicHeaders, Methods_tom6tv['get']['status']>(prefix, prefix1, GET, option).json(),
          /**
           * 返済情報の取得
           * @returns The request has succeeded.
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_tom6tv['get']['resBody'], BasicHeaders, Methods_tom6tv['get']['status']>(prefix, prefix1, GET, option).json().then(r => r.body),
          /**
           * 返済情報の更新
           * @returns The request has succeeded.
           */
          put: (option: { body: Methods_tom6tv['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_tom6tv['put']['resBody'], BasicHeaders, Methods_tom6tv['put']['status']>(prefix, prefix1, PUT, option).json(),
          /**
           * 返済情報の更新
           * @returns The request has succeeded.
           */
          $put: (option: { body: Methods_tom6tv['put']['reqBody'], config?: T | undefined }) =>
            fetch<Methods_tom6tv['put']['resBody'], BasicHeaders, Methods_tom6tv['put']['status']>(prefix, prefix1, PUT, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      history: {
        /**
         * 返済履歴の取得
         * @returns The request has succeeded.
         */
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_cgieia['get']['resBody'], BasicHeaders, Methods_cgieia['get']['status']>(prefix, PATH4, GET, option).json(),
        /**
         * 返済履歴の取得
         * @returns The request has succeeded.
         */
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_cgieia['get']['resBody'], BasicHeaders, Methods_cgieia['get']['status']>(prefix, PATH4, GET, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH4}`,
      },
      /**
       * 返済一覧情報の取得
       * @returns The request has succeeded.
       */
      get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1vcka1['get']['resBody'], BasicHeaders, Methods_1vcka1['get']['status']>(prefix, PATH3, GET, option).json(),
      /**
       * 返済一覧情報の取得
       * @returns The request has succeeded.
       */
      $get: (option?: { config?: T | undefined } | undefined) =>
        fetch<Methods_1vcka1['get']['resBody'], BasicHeaders, Methods_1vcka1['get']['status']>(prefix, PATH3, GET, option).json().then(r => r.body),
      /**
       * 返済情報の登録
       * @returns The request has succeeded.
       */
      post: (option: { body: Methods_1vcka1['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1vcka1['post']['resBody'], BasicHeaders, Methods_1vcka1['post']['status']>(prefix, PATH3, POST, option).json(),
      /**
       * 返済情報の登録
       * @returns The request has succeeded.
       */
      $post: (option: { body: Methods_1vcka1['post']['reqBody'], config?: T | undefined }) =>
        fetch<Methods_1vcka1['post']['resBody'], BasicHeaders, Methods_1vcka1['post']['status']>(prefix, PATH3, POST, option).json().then(r => r.body),
      $path: () => `${prefix}${PATH3}`,
    },
    users: {
      _userId: (val1: string) => {
        const prefix1 = `${PATH5}/${val1}`;

        return {
          requests: {
            /**
             * フレンド申請の送信
             * @returns 201レスポンス
             */
            post: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_r0kwp6['post']['resBody'], BasicHeaders, Methods_r0kwp6['post']['status']>(prefix, `${prefix1}${PATH6}`, POST, option).json(),
            /**
             * フレンド申請の送信
             * @returns 201レスポンス
             */
            $post: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_r0kwp6['post']['resBody'], BasicHeaders, Methods_r0kwp6['post']['status']>(prefix, `${prefix1}${PATH6}`, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix1}${PATH6}`,
          },
          /**
           * プロフィール情報の取得
           * @returns The request has succeeded.
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_pxqx5v['get']['resBody'], BasicHeaders, Methods_pxqx5v['get']['status']>(prefix, prefix1, GET, option).json(),
          /**
           * プロフィール情報の取得
           * @returns The request has succeeded.
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_pxqx5v['get']['resBody'], BasicHeaders, Methods_pxqx5v['get']['status']>(prefix, prefix1, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      friends: {
        _userId: (val2: string) => {
          const prefix2 = `${PATH7}/${val2}`;

          return {
            /**
             * フレンドの登録解除
             * @returns 200レスポンス
             */
            delete: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_jcjc85['delete']['resBody'], BasicHeaders, Methods_jcjc85['delete']['status']>(prefix, prefix2, DELETE, option).json(),
            /**
             * フレンドの登録解除
             * @returns 200レスポンス
             */
            $delete: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods_jcjc85['delete']['resBody'], BasicHeaders, Methods_jcjc85['delete']['status']>(prefix, prefix2, DELETE, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix2}`,
          };
        },
      },
      me: {
        /**
         * ユーザー情報の取得
         * @returns The request has succeeded.
         */
        get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_jzr18p['get']['resBody'], BasicHeaders, Methods_jzr18p['get']['status']>(prefix, PATH8, GET, option).json(),
        /**
         * ユーザー情報の取得
         * @returns The request has succeeded.
         */
        $get: (option?: { config?: T | undefined } | undefined) =>
          fetch<Methods_jzr18p['get']['resBody'], BasicHeaders, Methods_jzr18p['get']['status']>(prefix, PATH8, GET, option).json().then(r => r.body),
        /**
         * ユーザー情報の更新
         * @returns The request has succeeded.
         */
        put: (option: { body: Methods_jzr18p['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_jzr18p['put']['resBody'], BasicHeaders, Methods_jzr18p['put']['status']>(prefix, PATH8, PUT, option).json(),
        /**
         * ユーザー情報の更新
         * @returns The request has succeeded.
         */
        $put: (option: { body: Methods_jzr18p['put']['reqBody'], config?: T | undefined }) =>
          fetch<Methods_jzr18p['put']['resBody'], BasicHeaders, Methods_jzr18p['put']['status']>(prefix, PATH8, PUT, option).json().then(r => r.body),
        $path: () => `${prefix}${PATH8}`,
      },
      /**
       * メールアドレスによるユーザー情報の取得
       * @returns The request has succeeded.
       */
      get: (option?: { query?: Methods_1xhiioa['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody'], BasicHeaders, Methods_1xhiioa['get']['status']>(prefix, PATH5, GET, option).json(),
      /**
       * メールアドレスによるユーザー情報の取得
       * @returns The request has succeeded.
       */
      $get: (option?: { query?: Methods_1xhiioa['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_1xhiioa['get']['resBody'], BasicHeaders, Methods_1xhiioa['get']['status']>(prefix, PATH5, GET, option).json().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_1xhiioa['get']['query'] } | undefined) =>
        `${prefix}${PATH5}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
