/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループに対するメンバー情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.GroupMembers
  }

  /** グループに対するメンバーの追加 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Group
    reqBody: Types.Members
  }
}
