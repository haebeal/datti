/* eslint-disable */
import type * as Types from "../@types";

export type Methods = {
  /** 口座情報情報の登録 */
  post: {
    status: 201;
    /** 正常処理のレスポンス */
    resBody: Types.BankAccount;
    reqBody: Types.RequestBankAccount;
  };

  /** 口座情報情報の参照 */
  get: {
    status: 200;
    /** 正常処理のレスポンス */
    resBody: Types.BankAccount;
  };

  /** 口座情報情報の削除 */
  delete: {
    status: 200;

    /** 正常処理のレスポンス */
    resBody: {
      message?: string | undefined;
    };
  };
};
