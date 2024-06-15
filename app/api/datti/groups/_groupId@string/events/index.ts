/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループIDに紐づくイベント情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.EventsResponse
  }

  /** イベント情報の登録 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.EventResponse
    reqBody: Types.EventCreateRequest
  }
}
