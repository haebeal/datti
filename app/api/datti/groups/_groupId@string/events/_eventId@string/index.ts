/* eslint-disable */
import type * as Types from '../../../../@types'

export type Methods = {
  /** 登録されているイベント情報の取得 */
  get: {
    status: 200

    /** 200レスポンス */
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
      group_id: string
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

  /** イベント情報の更新 */
  put: {
    status: 200

    /** 200レスポンス */
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
      group_id: string
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
