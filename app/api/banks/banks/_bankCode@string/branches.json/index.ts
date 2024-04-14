/* eslint-disable */
import type * as Types from '../../../@types'

export type Methods = {
  /** Branchの配列を取得 */
  get: {
    query?: {
      /** ページ番号 */
      page?: number | undefined
      /** ページごとのエンティティ数 */
      per?: number | undefined
    } | undefined

    status: 200
    /** Branchの配列 */
    resBody: Types.Branch[]
  }
}
