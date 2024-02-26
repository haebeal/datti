/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** フレンド一覧の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Friend[]
  }

  /** フレンド申請の送信 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Friend
    reqBody: Types.ApplyingFriend
  }
}
