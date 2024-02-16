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
  op getUser():
  | User
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