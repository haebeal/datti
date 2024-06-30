/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループに対するメンバー情報の取得 */
  get: {
    query?: {
      status?: 'me' | 'applying' | 'requesting' | 'friend' | 'none' | undefined
    } | undefined

    status: 200
    /** The request has succeeded. */
    resBody: Types.GroupEndpoints_MembersGetResponse
  }

  /** グループに対するメンバーの追加 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.GroupEndpoints_GroupPostResponse
    reqBody: Types.GroupEndpoints_MembersPostRequest
  }
}
