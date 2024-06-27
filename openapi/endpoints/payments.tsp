import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;

/**
 * 支払い管理機能に関する操作
 */
@tag("Payments")
@route("payments")
namespace PaymentEndpoints {
  /**
   * 支払い一覧情報の取得 
   */
  @summary("返済情報一覧の取得")
  @get
  op getPayments():
  | PaymentUsers
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の取得
   */
  @route("{paymentId}")
  @summary("返済情報の取得")
  @get
  op getPayment(@path paymentId: string):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 返済履歴の取得
   */
  @route("history")
  @summary("返済履歴の取得")
  @get
  op getHistory():
  | Payment[]
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の登録
   */
  @summary("返済情報の登録")
  @post
  op postPayments(@body payment: PaymentCreate):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の更新
   */
  @route("{paymentId}")
  @summary("返済情報の更新")
  @put
  op putPayments(@path paymentId: string, @body payment: PaymentUpdate):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 支払い情報の削除
   */
  // @route("{paymentId}")
  // @summary("支払い情報の削除")
  // @delete
  // op deletePayments(@path paymentId: string):
  // | Utils.Response.OKMessage
  // | Utils.Error.UnauthorizedError
  // | Utils.Error.InternalServerError;
}

model Payment {
  /**
   * 支払いID
   */
  paymentId: string;

  /**
   * 支払い日
   */
  paidAt: utcDateTime;

  /**
   * 支払い先のユーザー情報
   */
  paidTo: OmitProperties<User, "status">;

  /**
   * 支払い元のユーザー情報
   */
  paidBy: OmitProperties<User, "status">;

  /**
   * 支払い金額
   */
  amount: integer;
}

model PaymentCreate {
  /**
   * 支払い日
   */
  paidAt: utcDateTime;

  /**
   * 支払い先のユーザ-ID
   */
  paidTo: string;

  /**
   * 支払い金額
   */
  amount: integer;
}

model PaymentUpdate {
  /**
   * 支払い日
   */
  paidAt: utcDateTime;

  /**
   * 支払い先のユーザ-ID
   */
  paidTo: string;

  /**
   * 支払い元のユーザー
   */
  paidBy: string;

  /**
   * 支払い金額
   */
  amount: integer;
}

model PaymentUser {
  /**
   * ユーザー情報
   */
  user: OmitProperties<User, "status">;
  /**
   * 支払い額
   */
  amount: integer;
}

model PaymentUsers{
  payments: PaymentUser[];
}
