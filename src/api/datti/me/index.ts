/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** 登録されてるプロフィール情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Profile
  }

  /** プロフィール情報の更新 */
  put: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Profile
    reqBody: Types.Profile
  }
}
