/* eslint-disable */
import type * as Types from '../../@types'

export type Methods = {
  /** Bankの配列を取得 */
  get: {
    query?: {
      /** ページ番号 */
      page?: number | undefined
      /** ページごとのエンティティ数 */
      per?: number | undefined
      /** ひらがなで部分一致 */
      kana?: string | undefined
      /** 金融機関コードの部分一致 */
      code?: string | undefined
      /** 金融機関名の部分一致 */
      name?: string | undefined
    } | undefined

    status: 200
    /** Bankの配列 */
    resBody: Types.Bank[]
  }
}
