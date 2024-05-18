/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** グループに対するメンバー情報の取得 */
  get: {
    status: 200
    /** The request has succeeded. */
    resBody: Types.GroupMembers
  }

  /** グループに対するメンバーの追加 */
  post: {
    status: 200

    /** 200レスポンス */
    resBody: {
      /** グループID */
      id: string
      /** グループ名 */
      name: string
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

    reqBody: Types.Members
  }
}
