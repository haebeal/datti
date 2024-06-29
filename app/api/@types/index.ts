/* eslint-disable */
export type EventEndpoints_EventPostRequest = {
  /** イベント名 */
  name: string
  /** イベントの日付 */
  eventedAt: string
  /** 立て替えたユーザー */
  paidBy: string
  /** 立て替えた金額 */
  amount: number
  /** 立て替えてもらったユーザー */
  payments: {
    paidTo: string
    amount: number
  }[]
}

export type EventEndpoints_EventPutRequest = {
  /** イベント名 */
  name: string
  /** イベントの日付 */
  eventedAt: string
  /** 立て替えたユーザー */
  paidBy: string
  /** 立て替えた金額 */
  amount: number
  /** 立て替えてもらったユーザー */
  payments: {
    paymentId?: string | undefined
    paidTo: string
    amount: number
  }[]
}

export type EventEndpoints_EventResponse = {
  eventId: string
  name: string
  eventedAt: string
  createdBy: string
  paidBy: string
  amount: number
  paymetns: {
    paymentId: string
    paidTo: string
    amount: string
  }[]
  groupId: string
}

export type EventEndpoints_EventsResponse = {
  events: {
    eventId: string
    name: string
    eventedAt: string

    paidBy: {
      userId: string
      name: string
    }

    amount: number
  }[]
}

export type Group = {
  /** グループID */
  groupId: string
  /** グループ名 */
  name: string
}

export type GroupEndpoints_GroupGetResponse = {
  /** グループID */
  groupId: string
  /** グループ名 */
  name: string
}

export type GroupEndpoints_GroupPostRequest = {
  /** グループ名 */
  name: string
  /** ユーザーID */
  userIds: string[]
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
  /** ユーザーID */
  userIds: string[]
}

export type Member = {
  /** ユーザーID */
  userId: string
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
  /** 返済ID */
  paymentId: string
  /** 返済日 */
  paidAt: string

  /** 返済先のユーザー情報 */
  paidTo: {
    /** ユーザーID */
    userId: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
    photoUrl: string
  }

  /** 返済元のユーザー情報 */
  paidBy: {
    /** ユーザーID */
    userId: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
    photoUrl: string
  }

  /** 返済金額 */
  amount: number
}

export type PaymentCreate = {
  /** 返済日 */
  paidAt: string
  /** 返済先のユーザ-ID */
  paidTo: string
  /** 返済金額 */
  amount: number
}

export type PaymentUpdate = {
  /** 返済日 */
  paidAt: string
  /** 返済先のユーザ-ID */
  paidTo: string
  /** 返済元のユーザー */
  paidBy: string
  /** 返済金額 */
  amount: number
}

export type PaymentUser = {
  /** ユーザー情報 */
  user: {
    /** ユーザーID */
    userId: string
    /** ユーザー名 */
    name: string
    /** メールアドレス */
    email: string
    /** 画像URL */
    photoUrl: string
  }

  /** 返済額 */
  amount: number
}

export type PaymentUsers = {
  payments: PaymentUser[]
}

export type User = {
  /** ユーザーID */
  userId: string
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
    userId: string
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
  userId: string
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
