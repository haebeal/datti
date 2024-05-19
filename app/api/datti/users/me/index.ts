/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** ユーザー情報の取得 */
  get: {
    status: 200

    /** 200レスポンス */
    resBody: {
      /** ユーザーID */
      uid: string
      /** ユーザー名 */
      name: string
      /** メールアドレス */
      email: string
      /** 画像URL */
      photoUrl: string

      /** 口座情報 */
      bank: Types.Bank

      /** フレンド状態のステータス */
      status: 'me' | 'applying' | 'requesting' | 'none'
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

  /** ユーザー情報の更新 */
  put: {
    status: 200

    /** 200レスポンス */
    resBody: {
      /** ユーザーID */
      uid: string
      /** ユーザー名 */
      name: string
      /** メールアドレス */
      email: string
      /** 画像URL */
      photoUrl: string

      /** 口座情報 */
      bank: Types.Bank

      /** フレンド状態のステータス */
      status: 'me' | 'applying' | 'requesting' | 'none'
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

    reqBody: Types.UserUpdateRequest
  }
}
