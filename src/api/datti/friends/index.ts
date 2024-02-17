/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** フレンド申請の送信 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Friend
    reqBody: Types.Friend
  }
}
