/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** フレンド申請未承認のユーザーを取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.UserList
  }
}
