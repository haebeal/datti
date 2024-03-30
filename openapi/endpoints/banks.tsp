import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;
/**
 * ユーザーの振込先口座情報に関する操作
 */
@tag("Banks")
@route("bank")
namespace Banks {
  /**
   * 登録されている口座情報の取得
   */
  @summary("口座情報の取得")
  @get
  op getMyBank():
  | Utils.Response.OKResponse<Bank>
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;
  
  /**
   * 口座情報の登録・更新
   */
  @summary("口座情報の登録・更新")
  @post
  op createMyBank(...Bank):
    | Utils.Response.CreatedResponse<Bank>
    | Utils.Error.UnauthorizedError
    | Utils.Error.InternalServerError;
  
  /**
   * 登録されている口座情報の削除
   */
  @summary("口座情報の削除")
  @delete
  op deleteMyBank():
    | Utils.Response.OKResponse<Bank>
    | Utils.Error.UnauthorizedError
    | Utils.Error.InternalServerError;
}

model Bank {
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
