/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループIDに紐づくイベント情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.EventEndpoints_EventsResponse
  }

  /** イベント情報の登録 */
  post: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.EventEndpoints_EventResponse
    reqBody: Types.EventEndpoints_EventPostRequest
  }
}
