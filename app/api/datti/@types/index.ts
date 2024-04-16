/* eslint-disable */
export type Bank = {
  /** 金融機関コード */
  bankCode: string
  /** 支店番号 */
  branchCode: string
  /** 口座番号 */
  accountCode: string
}

export type Event = {
  /** イベントID */
  id: string
  /** イベント名 */
  name: string
  /** イベントの日付 */
  evented_at: string

  /** イベント作成者のユーザー情報 */
  created_by: User

  /** イベントの紐づいたグループID */
  group_id: string
}

export type EventCreate = {
  /** イベント名 */
  name: string
  /** イベントの日付 */
  evented_at: string
}

export type EventList = {
  events: {
    /** イベントID */
    id: string
    /** イベント名 */
    name: string
    /** イベントの日付 */
    evented_at: string
    /** イベント作成者のユーザー情報 */
    created_by: string
    /** イベントの紐づいたグループID */
    group_id: string
  }[]
}

export type EventUpdate = {
  /** イベント名 */
  name: string
  /** イベントの日付 */
  evented_at: string
}

export type Group = {
  /** グループID */
  id: string
  /** グループ名 */
  name: string
}

export type GroupCreateRequest = {
  /** グループ名 */
  name: string
  /** UID */
  uids: string[]
}

export type GroupList = {
  /** グループ */
  groups: Group[]
}

export type GroupUpdateRequest = {
  /** グループ名 */
  name: string
}

export type GroupUsers = {
  /** グループID */
  id: string
  /** グループ名 */
  name: string
  /** ユーザー情報 */
  users: User[]
}

export type Members = {
  /** UID */
  uids: string[]
}

export type Payment = {
  /** 支払い日 */
  paid_at: string

  /** 支払い先のユーザー情報 */
  paid_to: User

  /** 支払い元のユーザー情報 */
  paid_by: User

  /** 支払い金額 */
  amount: string
}

export type PaymentUser = {
  /** ユーザー情報 */
  user: User

  /** 口座情報 */
  bank_account: Bank

  /** 支払い額 */
  amount: string
}

export type PaymentUserList = {
  payments: PaymentUser[]
}

export type PaymentsRequest = {
  /** 支払い日 */
  paid_at: string
  /** 支払い先のユーザー情報 */
  paid_to: string
  /** 支払い金額 */
  amount: string
}

export type User = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** メールアドレス */
  email: string
  /** 画像URL */
  photoUrl: string
}

export type UserGetRequest = {
  /** メールアドレス */
  email: string
}

export type UserList = {
  users: User[]
}

export type UserUpdateRequest = {
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}
