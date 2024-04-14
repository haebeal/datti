import { dataToURLString } from 'aspida';

import type { Methods as Methods_ps3hza } from './banks/_bankCode@string/branches/_branchCode@string.json';
import type { Methods as Methods_b870bt } from './banks/_bankCode@string/branches/search.json';
import type { Methods as Methods_s4m07a } from './banks/_bankCode@string/branches.json';
import type { Methods as Methods_trfhcb } from './banks/_bankCode@string.json';
import type { Methods as Methods_1kgkqei } from './banks/search.json';
import type { Methods as Methods_mc0lvb } from './banks.json';
import type { AspidaClient, BasicHeaders } from 'aspida';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? 'https://bank.teraren.com' : baseURL).replace(/\/$/, '');
  const PATH0 = '/banks';
  const PATH1 = '/branches';
  const PATH2 = '/branches/search.json';
  const PATH3 = '/branches.json';
  const PATH4 = '/banks/search.json';
  const PATH5 = '/banks.json';
  const GET = 'GET';

  return {
    banks: {
      _bankCode_string: (val1: string) => {
        const prefix1 = `${PATH0}/${val1}`;

        return {
          branches: {
            _branchCode_json: (val3: string) => {
              const prefix3 = `${prefix1}${PATH1}/${val3}.json`;

              return {
                /**
                 * Branchの配列を取得
                 * @returns 正常
                 */
                get: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_ps3hza['get']['resBody'], BasicHeaders, Methods_ps3hza['get']['status']>(prefix, prefix3, GET, option).json(),
                /**
                 * Branchの配列を取得
                 * @returns 正常
                 */
                $get: (option?: { config?: T | undefined } | undefined) =>
                  fetch<Methods_ps3hza['get']['resBody'], BasicHeaders, Methods_ps3hza['get']['status']>(prefix, prefix3, GET, option).json().then(r => r.body),
                $path: () => `${prefix}${prefix3}`,
              };
            },
            search_json: {
              /**
               * Branchの配列を取得
               * @returns Branchの配列
               */
              get: (option?: { query?: Methods_b870bt['get']['query'] | undefined, config?: T | undefined } | undefined) =>
                fetch<Methods_b870bt['get']['resBody'], BasicHeaders, Methods_b870bt['get']['status']>(prefix, `${prefix1}${PATH2}`, GET, option).json(),
              /**
               * Branchの配列を取得
               * @returns Branchの配列
               */
              $get: (option?: { query?: Methods_b870bt['get']['query'] | undefined, config?: T | undefined } | undefined) =>
                fetch<Methods_b870bt['get']['resBody'], BasicHeaders, Methods_b870bt['get']['status']>(prefix, `${prefix1}${PATH2}`, GET, option).json().then(r => r.body),
              $path: (option?: { method?: 'get' | undefined; query: Methods_b870bt['get']['query'] } | undefined) =>
                `${prefix}${prefix1}${PATH2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
            },
          },
          branches_json: {
            /**
             * Branchの配列を取得
             * @returns Branchの配列
             */
            get: (option?: { query?: Methods_s4m07a['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods_s4m07a['get']['resBody'], BasicHeaders, Methods_s4m07a['get']['status']>(prefix, `${prefix1}${PATH3}`, GET, option).json(),
            /**
             * Branchの配列を取得
             * @returns Branchの配列
             */
            $get: (option?: { query?: Methods_s4m07a['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods_s4m07a['get']['resBody'], BasicHeaders, Methods_s4m07a['get']['status']>(prefix, `${prefix1}${PATH3}`, GET, option).json().then(r => r.body),
            $path: (option?: { method?: 'get' | undefined; query: Methods_s4m07a['get']['query'] } | undefined) =>
              `${prefix}${prefix1}${PATH3}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
          },
        };
      },
      _bankCode_string_json: (val1: string) => {
        const prefix1 = `${PATH0}/${val1}.json`;

        return {
          /**
           * Bankを取得
           * @returns 正常
           */
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_trfhcb['get']['resBody'], BasicHeaders, Methods_trfhcb['get']['status']>(prefix, prefix1, GET, option).json(),
          /**
           * Bankを取得
           * @returns 正常
           */
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods_trfhcb['get']['resBody'], BasicHeaders, Methods_trfhcb['get']['status']>(prefix, prefix1, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${prefix1}`,
        };
      },
      search_json: {
        /**
         * Bankの配列を取得
         * @returns Bankの配列
         */
        get: (option?: { query?: Methods_1kgkqei['get']['query'] | undefined, config?: T | undefined } | undefined) =>
          fetch<Methods_1kgkqei['get']['resBody'], BasicHeaders, Methods_1kgkqei['get']['status']>(prefix, PATH4, GET, option).json(),
        /**
         * Bankの配列を取得
         * @returns Bankの配列
         */
        $get: (option?: { query?: Methods_1kgkqei['get']['query'] | undefined, config?: T | undefined } | undefined) =>
          fetch<Methods_1kgkqei['get']['resBody'], BasicHeaders, Methods_1kgkqei['get']['status']>(prefix, PATH4, GET, option).json().then(r => r.body),
        $path: (option?: { method?: 'get' | undefined; query: Methods_1kgkqei['get']['query'] } | undefined) =>
          `${prefix}${PATH4}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
      },
    },
    banks_json: {
      /**
       * Bankの配列を取得
       * @returns Bankの配列
       */
      get: (option?: { query?: Methods_mc0lvb['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_mc0lvb['get']['resBody'], BasicHeaders, Methods_mc0lvb['get']['status']>(prefix, PATH5, GET, option).json(),
      /**
       * Bankの配列を取得
       * @returns Bankの配列
       */
      $get: (option?: { query?: Methods_mc0lvb['get']['query'] | undefined, config?: T | undefined } | undefined) =>
        fetch<Methods_mc0lvb['get']['resBody'], BasicHeaders, Methods_mc0lvb['get']['status']>(prefix, PATH5, GET, option).json().then(r => r.body),
      $path: (option?: { method?: 'get' | undefined; query: Methods_mc0lvb['get']['query'] } | undefined) =>
        `${prefix}${PATH5}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`,
    },
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
