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
  /** イベント作成者のUID */
  uid: string
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
  events: Event[]
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

export type UserUpdateRequest = {
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}
