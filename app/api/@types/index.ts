/* eslint-disable */
export type EventEndpoints_EventPostRequest = {
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

export type EventEndpoints_EventPutRequest = {
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

export type EventEndpoints_EventResponse = {
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

export type EventEndpoints_EventsResponse = {
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

export type Group = {
  /** グループID */
  id: string
  /** グループ名 */
  name: string
}

export type GroupEndpoints_GroupGetResponse = {
  /** グループID */
  id: string
  /** グループ名 */
  name: string
}

export type GroupEndpoints_GroupPostRequest = {
  /** グループ名 */
  name: string
  /** UID */
  uids: string[]
}

export type GroupEndpoints_GroupPutRequest = {
  /** グループ名 */
  name: string
}

export type GroupEndpoints_GroupsGetResponse = {
  /** グループ */
  groups: Group[]
}

export type GroupEndpoints_MembersGetResponse = {
  members: Member[]
}

export type GroupEndpoints_MembersPostRequest = {
  /** UID */
  uids: string[]
}

export type Member = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** メールアドレス */
  email: string
  /** 画像URL */
  photoUrl: string
  /** フレンド状態のステータス */
  status: 'me' | 'applying' | 'requesting' | 'friend' | 'none'
}

export type Payment = {
  /** 支払いID */
  id: string
  /** 支払い日 */
  paid_at: string

  /** 支払い先のユーザー情報 */
  paid_to: {
    /** ユーザーID */
    uid: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
    photoUrl: string
  }

  /** 支払い元のユーザー情報 */
  paid_by: {
    /** ユーザーID */
    uid: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
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
    /** ユーザーID */
    uid: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
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
  status: 'me' | 'applying' | 'requesting' | 'friend' | 'none'
}

export type UserEndpoints_Friends = {
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

export type UserEndpoints_UserGetResponse = {
  /** ユーザーID */
  uid: string
  /** ユーザー名 */
  name: string
  /** メールアドレス */
  email: string
  /** 画像URL */
  photoUrl: string
  /** フレンド状態のステータス */
  status: 'me' | 'applying' | 'requesting' | 'friend' | 'none'
}

export type UserEndpoints_UserPutRequest = {
  /** ユーザー名 */
  name: string
  /** 画像URL */
  photoUrl: string
}

export type UserEndpoints_UsersGetResponse = {
  users: User[]
}
