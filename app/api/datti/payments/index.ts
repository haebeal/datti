/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** 支払い一覧情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.PaymentUserList
  }

  /** 支払い情報の登録 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment
    reqBody: Types.PaymentsRequest
  }
}
