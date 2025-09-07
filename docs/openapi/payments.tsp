import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
 * 支払い
 */
@tag("Payment")
@route("/payments/events")
namespace Payment {
  /**
   * 支払いのイベントの作成
   */
  @summary("支払いイベントの作成")
  interface PaymentEvent {
    @post
    create(@body event: CreateEventRequest):
      | {
          /**
           * 正常レスポンス
           */
          @statusCode statusCode: 201;

          @body newEvent: CreateEventResponse;
        }
      | {
          @statusCode statusCode: 400;
          @body body: ErrorResponse;
        }
      | {
          @statusCode statusCode: 401;
          @body body: ErrorResponse;
        }
      | {
          @statusCode statusCode: 500;
          @body body: ErrorResponse;
        };
  }
  model CreateEventRequest {
    name: string;
    eventDate: utcDateTime;
    payer: {
      id: string;
      amount: uint64;
    };
    debtors: {
      id: string;
      amount: uint64;
    }[];
  }

  model CreateEventResponse {
    id: string;
    name: string;
    eventDate: utcDateTime;
    payer: {
      id: string;
      name: string;
      email: string;
      avatar: url;
      amount: uint64;
    };
    debtors: {
      id: string;
      name: string;
      email: string;
      avatar: url;
      amount: uint64;
    }[];
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }
}

model ErrorResponse {
  message: string;
}
