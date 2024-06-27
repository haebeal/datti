import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiAPI;

/**
 * 返済管理機能に関する操作
 */
@tag("Payments")
@route("payments")
namespace PaymentEndpoints {
  /**
   * 返済一覧情報の取得 
   */
  @summary("返済情報一覧の取得")
  @get
  op getPayments():
  | PaymentUsers
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 返済情報の取得
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
   * 返済情報の登録
   */
  @summary("返済情報の登録")
  @post
  op postPayments(@body payment: PaymentCreate):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 返済情報の更新
   */
  @route("{paymentId}")
  @summary("返済情報の更新")
  @put
  op putPayments(@path paymentId: string, @body payment: PaymentUpdate):
  | Payment
  | Utils.Error.UnauthorizedError
  | Utils.Error.InternalServerError;

  /**
   * 返済情報の削除
   */
  // @route("{paymentId}")
  // @summary("返済情報の削除")
  // @delete
  // op deletePayments(@path paymentId: string):
  // | Utils.Response.OKMessage
  // | Utils.Error.UnauthorizedError
  // | Utils.Error.InternalServerError;
}

model Payment {
  /**
   * 返済ID
   */
  paymentId: string;

  /**
   * 返済日
   */
  paidAt: utcDateTime;

  /**
   * 返済先のユーザー情報
   */
  paidTo: OmitProperties<User, "status">;

  /**
   * 返済元のユーザー情報
   */
  paidBy: OmitProperties<User, "status">;

  /**
   * 返済金額
   */
  amount: integer;
}

model PaymentCreate {
  /**
   * 返済日
   */
  paidAt: utcDateTime;

  /**
   * 返済先のユーザ-ID
   */
  paidTo: string;

  /**
   * 返済金額
   */
  amount: integer;
}

model PaymentUpdate {
  /**
   * 返済日
   */
  paidAt: utcDateTime;

  /**
   * 返済先のユーザ-ID
   */
  paidTo: string;

  /**
   * 返済元のユーザー
   */
  paidBy: string;

  /**
   * 返済金額
   */
  amount: integer;
}

model PaymentUser {
  /**
   * ユーザー情報
   */
  user: OmitProperties<User, "status">;
  /**
   * 返済額
   */
  amount: integer;
}

model PaymentUsers{
  payments: PaymentUser[];
}
