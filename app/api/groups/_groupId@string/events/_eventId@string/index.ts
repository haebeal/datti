/* eslint-disable */
import type * as Types from '../../../../@types'

export type Methods = {
  /** 登録されているイベント情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.EventResponse
  }

  /** イベント情報の更新 */
  put: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.EventResponse
    reqBody: Types.EventUpdateRequest
  }

  /** イベント情報の削除 */
  delete: {
    status: 200

    /** 200レスポンス */
    resBody: {
      message: string
    }
  }
}
