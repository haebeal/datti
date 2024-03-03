import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * ユーザー情報に関する操作
 */
@tag("Users")
@route("users")
namespace Users {
  /**
   * メールアドレスによるユーザー情報の取得
   */
  @summary("ユーザー情報の取得")
  @get
  op getUser(...UserGetRequest):
  | User
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * プロフィール情報の取得
   */
  @route("me")
  @summary("プロフィール情報の取得")
  @get()
  op getProfile():
  | Profile
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  /**
   * プロフィール情報の更新
   */
  @route("me")
  @summary("プロフィール情報の更新")
  @put
  op updateProfile(...ProfileUpdateRequest):
  | Profile
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * プロフィール情報の取得
   */
  @summary("プロフィール情報の取得")
  @route("{uid}")
  @get()
  op getProfileByUid(@path uid: string):
  | Profile
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請の送信
   */
  @route("{uid}/requests")
  @summary("フレンド申請の送信")
  @post
  op sendFriend(@path uid: string):
  | Utils.Response.CreatedMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

}

model User {
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

model UserGetRequest {
  /**
   * メールアドレス
   */
  email: string;
}

model ProfileUpdateRequest{
  /**
   * ユーザー名
   */
  name: string;

  /**
   * 画像URL
   */
  photoUrl: string;
}