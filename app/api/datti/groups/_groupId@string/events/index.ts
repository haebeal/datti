/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループIDに紐づくイベント情報の取得 */
  get: {
    status: 200

    /** 200レスポンス */
    resBody: {
      events: Types.Event[]
      /** 作成時間 */
      createdAt: string
      /** 更新時間 */
      updatedAt: string
      /**
       * 削除時間
       * 論理削除されていない場合はnull
       */
      deletedAt: string | null
    }
  }

  /** イベント情報の登録 */
  post: {
    status: 201

    /** 201レスポンス */
    resBody: {
      /** イベントID */
      id: string
      /** イベント名 */
      name: string
      /** イベントの日付 */
      evented_at: string

      /** イベント作成者のユーザー情報 */
      created_by: Types.User

      /** イベントの紐づいたグループID */
      group_id?: string | undefined
      /** 作成時間 */
      createdAt: string
      /** 更新時間 */
      updatedAt: string
      /**
       * 削除時間
       * 論理削除されていない場合はnull
       */
      deletedAt: string | null
    }

    reqBody: Types.EventCreateRequest
  }
}
