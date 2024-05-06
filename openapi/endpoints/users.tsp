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
  @route("{uid}")
  @get()
  op getUserByUid(@path uid: string):
  | Utils.Response.OKResponse<User>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * フレンド申請の送信
   */
  @route("{uid}/requests")
  @summary("フレンド申請の送信")
  @post
  op friendRequest(@path uid: string):
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
   * 金融機関コード
   */
  @minLength(4)
  @maxLength(4)
  bankCode: string;

  /**
   * 支店番号
   */
  @minLength(3)
  @maxLength(3)
  branchCode: string;
  
  /**
   * 口座番号
   */
  @minLength(7)
  @maxLength(7)
  accountCode: string;
}
