/* eslint-disable */
export type ApplyingFriend = {
  /** フレンド申請受信者のユーザーID */
  uid: string
}

export type Bank = {
  /** 金融機関コード */
  bankCode: string
  /** 支店番号 */
  branchCode: string
  /** 口座番号 */
  accountCode: string
}

export type Friend = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
  status: FriendStatus
}

/** フレンド状況 */
export type FriendStatus = 'friend' | 'applying' | 'applied'

export type Profile = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}

export type ProfileUpdateRequest = {
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}

export type User = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}

export type UserGetRequest = {
  /** メールアドレス */
  email: string
}
