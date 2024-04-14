/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループに対するメンバーの追加 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.GroupUsers
    reqBody: Types.Members
  }
}
