/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** ユーザー情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.UserEndpoints_UserGetResponse
  }

  /** ユーザー情報の更新 */
  put: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.UserEndpoints_UserGetResponse
    reqBody: Types.UserEndpoints_UserPutRequest
  }
}
