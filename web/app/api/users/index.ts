/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** メールアドレスによるユーザー情報の取得 */
  get: {
    query?: {
      email?: string | undefined
      status?: 'me' | 'applying' | 'requesting' | 'friend' | 'none' | undefined
    } | undefined

    status: 200
    /** The request has succeeded. */
    resBody: Types.UserEndpoints_UsersGetResponse
  }
}
