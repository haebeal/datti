/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** フレンドのユーザーを取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.UserEndpoints_Friends
  }
}
