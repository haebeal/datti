/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** グループ情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Group
  }

  /** グループ情報の更新 */
  put: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Group
    reqBody: Types.GroupUpdateRequest
  }
}
