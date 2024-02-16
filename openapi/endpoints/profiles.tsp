import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * ユーザーのプロフィール情報に関する操作
 */
@tag("Profile")
@route("me")
namespace Profiles {
  /**
   * 登録されてるプロフィール情報の取得
   */
  @summary("プロフィール情報の取得")
  @get
  op getProfile():
  | Profile
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  /**
   * プロフィール情報の更新
   */
  @summary("プロフィール情報の更新")
  @put
  op updateProfile(...Profile):
  | Profile
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

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