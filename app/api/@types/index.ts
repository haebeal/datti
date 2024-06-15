/* eslint-disable */
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
  payments: {
    paid_to: string
    amount: number
  }[]
}

export type EventResponse = {
  id: string
  name: string
  evented_at: string
  created_by: string
  paid_by: string
  amount: number
  paymetns: {
    payment_id: string
    paid_to: string
    amount: string
  }[]
  group_id: string
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
  payments: {
    payment_id: string
    paid_to: string
    amount: number
  }[]
}

export type EventsResponse = {
  events: {
    id: string
    name: string
    evented_at: string

    paid_by: {
      id: string
      name: string
    }

    amount: number
  }[]
}

export type Friends = {
  users: {
    /** ユーザーID */
    uid: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
    photoUrl: string
  }[]
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
  members: {
    /** ユーザーID */
    uid: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
    photoUrl: string
    /** フレンド状態のステータス */
    status: 'me' | 'applying' | 'requesting' | 'none' | 'applying' | 'requesting' | 'none'
  }[]
}

export type GroupUpdateRequest = {
  /** グループ名 */
  name: string
}

export type Groups = {
  /** グループ */
  groups: Group[]
}

export type Members = {
  /** UID */
  uids: string[]
}

export type Payment = {
  /** 支払いID */
  id: string
  /** 支払い日 */
  paid_at: string

  /** 支払い先のユーザー情報 */
  paid_to: {
    id: string
    name: string
    email: string
    photoUrl: string
  }

  /** 支払い元のユーザー情報 */
  paid_by: {
    id: string
    name: string
    email: string
    photoUrl: string
  }

  /** 支払い金額 */
  amount: number
}

export type PaymentCreate = {
  /** 支払い日 */
  paid_at: string
  /** 支払い先のユーザ-ID */
  paid_to: string
  /** 支払い金額 */
  amount: number
}

export type PaymentUpdate = {
  /** 支払い日 */
  paid_at: string
  /** 支払い先のユーザ-ID */
  paid_to: string
  /** 支払い元のユーザー */
  paid_by: string
  /** 支払い金額 */
  amount: number
}

export type PaymentUser = {
  /** ユーザー情報 */
  user: {
    uid: string
    name: string
    email: string
    photoUrl: string
  }

  /** 支払い額 */
  amount: number
}

export type PaymentUsers = {
  payments: PaymentUser[]
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
  /** フレンド状態のステータス */
  status: 'me' | 'applying' | 'requesting' | 'none' | 'applying' | 'requesting' | 'none'
}

export type UserUpdateRequest = {
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}

export type UsersResponse = {
  users: User[]
}
