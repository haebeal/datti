import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * ユーザーの振込先口座情報に関する操作
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
  | Utils.Response.OKResponse<Profile>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  /**
   * プロフィール情報の更新
   */
  @summary("プロフィール情報の更新")
  @put
  op updateProfile(...Profile):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
}

model Profile {
  /**
   * ユーザー名
   */
  name: string;

  /**
   * 画像URL
   */
  photoUrl: string;
}