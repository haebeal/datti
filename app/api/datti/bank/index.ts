/* eslint-disable */
import type * as Types from '../@types'

export type Methods = {
  /** 登録されている口座情報の取得 */
  get: {
    status: 200

    /** 200レスポンス */
    resBody: {
      /** 金融機関コード */
      bankCode: string
      /** 支店番号 */
      branchCode: string
      /** 口座番号 */
      accountCode: string
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

  /** 口座情報の登録・更新 */
  post: {
    status: 201

    /** 201レスポンス */
    resBody: {
      /** 金融機関コード */
      bankCode: string
      /** 支店番号 */
      branchCode: string
      /** 口座番号 */
      accountCode: string
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

    reqBody: Types.Bank
  }
}
