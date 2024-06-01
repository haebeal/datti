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
  group_id?: string | undefined
}

export type EventCreateRequest = {
  /** イベント名 */
  name: string
  /** イベントの日付 */
  evented_at: string
  /** 立て替えたユーザー */
  paid_by: string
  /** 立て替えた金額 */
  amount: number
  /** 立て替えてもらったユーザー */
  payments: Payment[]
}

export type EventUpdateRequest = {
  /** イベント名 */
  name: string
  /** イベントの日付 */
  evented_at: string
  /** 立て替えたユーザー */
  paid_by: string
  /** 立て替えた金額 */
  amount: number
  /** 立て替えてもらったユーザー */
  payments: Payment[]
}

export type EventsResponse = {
  events: Event[]
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

export type GroupMembers = {
  /** ユーザー情報 */
  members: User[]
}

export type GroupResponse = {
  /** グループID */
  id: string
  /** グループ名 */
  name: string
}

export type GroupUpdateRequest = {
  /** グループ名 */
  name: string
}

export type GroupsResponse = {
  /** グループ */
  groups: Group[]
}

export type Members = {
  /** UID */
  uids: string[]
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

  /** 口座情報 */
  bank: Bank

  /** フレンド状態のステータス */
  status: 'me' | 'applying' | 'requesting' | 'none'
}

export type UserUpdateRequest = {
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string

  /** 口座情報 */
  bank: Bank
}

export type UsersResponse = {
  users: User[]
}

/** 建て替えてもらうユーザーの型 */
export type Payment = {
  user: string
  amount: number
}
