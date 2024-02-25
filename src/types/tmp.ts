export type Friend = {
  /** ユーザーID */
  uid: string;
  /** ユーザー名 */
  name: string;
  /** 画像URL */
  photoUrl: string;
  /** 申請ステータス */
  status: "friend" | "applying" | "applied";
};
