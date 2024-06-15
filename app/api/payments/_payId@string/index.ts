/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** 支払い情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment
  }

  /** 支払い情報の更新 */
  put: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment
    reqBody: Types.PaymentUpdate
  }

  /** 支払い情報の削除 */
  delete: {
    status: 200

    /** 200レスポンス */
    resBody: {
      message: string
    }
  }
}
