/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** 返済情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment
  }

  /** 返済情報の更新 */
  put: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment
    reqBody: Types.PaymentUpdate
  }
}
