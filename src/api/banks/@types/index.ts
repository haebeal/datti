/* eslint-disable */
/** 金融機関エンティティ */
export type Bank = {
  /** 金融機関コード */
  code: string
  /** 名称 */
  name: string
  /** カタカナ */
  kana?: string | undefined
  /** ひらがな */
  hira?: string | undefined
  normalize?: NormalizedName | undefined
  /** Bankエンティティを取得するURL */
  url?: string | undefined
  /** Branchエンティティの一覧を取得するURL */
  branches_url?: string | undefined
  /** 作成日時 */
  created_at?: string | undefined
  /** 更新日時 */
  updated_at?: string | undefined
}

/** 支店エンティティ */
export type Branch = {
  /** 支店コード */
  code: string
  /** 支店名 */
  name?: string | null | undefined
  /** ひらがな */
  hira?: string | null | undefined
  /** カタカナ */
  kana?: string | null | undefined
  /** ローマ字読み */
  roma?: string | null | undefined
  normalize?: NormalizedName | undefined
  /** 作成日時 */
  created_at?: string | undefined
  /** 更新日時 */
  updated_at?: string | undefined
}

/** 読みやすい名称 */
export type NormalizedName = {
  /** 名称 */
  name: string
  /** カタカナ */
  kana: string
  /** ローマ字読み */
  roma: string | null
  /** ひらがな */
  hira: string
}

/** A standard error object. */
export type Error = {
  code: string
  message: string
}
