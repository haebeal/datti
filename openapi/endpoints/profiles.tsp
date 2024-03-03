model Profile {
  /**
   * ユーザーID
   */
  @minLength(28)
  @maxLength(28)
  uid: string;
  /**
   * ユーザー名
   */
  name: string;

  /**
   * 画像URL
   */
  photoUrl: string;
}

