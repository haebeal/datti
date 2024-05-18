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
  @summary("メールアドレスによるユーザー情報の取得")
  @get
  op getUserByEmail(@query email?: string):
  | Utils.Response.OKResponse<UsersResponse>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * ユーザー情報の取得
   */
  @route("me")
  @summary("ユーザー情報（自分）の取得")
  @get()
  op getMe():
  | Utils.Response.OKResponse<User>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  /**
   * ユーザー情報の更新
   */
  @route("me")
  @summary("ユーザー情報（自分）の更新")
  @put
  op updateMe(...UserUpdateRequest):
  | Utils.Response.OKResponse<User>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * プロフィール情報の取得
   */
  @summary("UIDによるユーザー情報の取得")
  @route("{userId}")
  @get()
  op getUserByUid(@path userId: string):
  | Utils.Response.OKResponse<User>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請の送信
   */
  @route("{userId}/requests")
  @summary("フレンド申請の送信")
  @post
  op friendRequest(@path userId: string):
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
   * メールアドレス
   */
  email: string;

  /**
   * 画像URL
   */
  photoUrl: string;

  /**
   * 口座情報
   */
  bank: Bank;

  /**
   * フレンド状態のステータス
   */
  status: "me" | "applying" | "requesting" | "none";
}

model UsersResponse {
  users: User[];
}

model UserUpdateRequest{
  /**
   * ユーザー名
   */
  name: string;

  /**
   * 画像URL
   */
  photoUrl: string;

  /**
   * 口座情報
   */
  bank: Bank;
}
