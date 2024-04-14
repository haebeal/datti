/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** フレンド申請中のユーザーを取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.User[]
  }
}
