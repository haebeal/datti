/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** 返済履歴の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.Payment[]
  }
}
