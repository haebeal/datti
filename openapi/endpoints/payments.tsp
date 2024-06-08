import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;

/**
 * 支払い管理機能に関する操作
 */
@tag("Payments")
@route("payments")
namespace Payments {
  /**
   * 支払い一覧情報の取得 
   */
  @summary("支払い一覧情報の取得")
  @get
  op getPayments():
  | PaymentUserList
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の取得
   */
  @route("{payId}")
  @summary("支払い情報の取得")
  @get
  op getPayment(@path payId: string):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の登録
   */
  @summary("支払い情報の登録")
  @post
  op postPayments(@body payment: PaymentsRequest):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の更新
   */
  @route("{payId}")
  @summary("支払い情報の更新")
  @put
  op putPayments(@path payId: string, @body payment: PaymentsRequest):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の削除
   */
  @route("{payId}")
  @summary("支払い情報の削除")
  @delete
  op deletePayments(@path payId: string):
  | Utils.Response.OKMessage
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

}

model Payment {
  /**
   * 支払い日
   */
  paid_at: utcDateTime;

  /**
   * 支払い先のユーザー情報
   */
  paid_to: User;

  /**
   * 支払い元のユーザー情報
   */
  paid_by: User;

  /**
   * 支払い金額
   */
  amount: string;
}

model PaymentsRequest {
  /**
   * 支払い日
   */
  paid_at: utcDateTime;

  /**
   * 支払い先のユーザー情報
   */
  paid_to: string;

  /**
   * 支払い金額
   */
  amount: string;
}

model PaymentUser {
  /**
   * ユーザー情報
   */
  user: User;

  /**
   * 支払い額
   */
  amount: string;
}

model PaymentUserList{
  payments: PaymentUser[];
}
