/* eslint-disable */
export type Bank = {
  /** ユーザーID */
  uid: string
  /** 金融機関コード */
  bankCode: string
  /** 支店番号 */
  branchCode: string
  /** 口座番号 */
  accountCode: string
}

export type Friend = {
  /** フレンド申請送信者のユーザーID */
  uid: string
  /** フレンド申請受信者のユーザーID */
  friendUid: string
}

export type Profile = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}

export type Request = {
  /** メールアドレス */
  email: string
}

export type User = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}
