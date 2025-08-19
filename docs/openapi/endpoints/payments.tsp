import "../utils";

using TypeSpec.Http;
using Utils;

namespace DattiApi;

/**
 * 支払い
 */
@tag("Payment")
@route("/payments")
namespace Payments {
  /**
   * 支払いのイベントの作成
   */
  @summary("支払いイベントの作成")
  interface CreatePaymentEvent {
    @post
    op createPaymentEvent(@body event: PaymentEvent): {
      /**
       * 正常レスポンス
       */
      @statusCode statusCode: 201; 
      @body newEvent: PaymentEvent;
    } 
    | Error.BadRequestError
    | Error.UnauthorizedError 
    | Error.InternalServerError 
  }
}

model PaymentEvent {
  id: string;
  name: string;
  eventDate: utcDateTime;
  payer: Payer;
  debtors: Debtor[];
  createdAt: utcDateTime;
  updatedAt: utcDateTime; 
}

/**
 * 債権者
 */
model Payer {
  user: User;
  amount: uint64;
}

/**
 * 債務者
 */
model Debtor {
  user: User;
  amount: uint64;
}
