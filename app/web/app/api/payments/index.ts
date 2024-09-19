/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** 返済一覧情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.PaymentUsers
  }

  /** 返済情報の登録 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment
    reqBody: Types.PaymentCreate
  }
}
