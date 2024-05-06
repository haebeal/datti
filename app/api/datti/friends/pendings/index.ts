/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** フレンド申請未承認のユーザーを取得 */
  get: {
    status: 200

    /** 200レスポンス */
    resBody: {
      users: Types.User[]
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
}
