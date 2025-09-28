import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
 * 立て替えイベント
 */
@tag("Lendings")
@route("/lendings")
namespace Lending {
  /**
   * 立て替えたイベントの作成
   */
  interface LendingEvent {
    @summary("立て替えイベントの作成")
    @post
    create(@body event: CreateLendingEventRequest):
      | {
          /**
           * 正常レスポンス
           */
          @statusCode statusCode: 201;

          @body newEvent: CreateLendingEventResponse;
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

    @summary("立て替えたイベントの取得")
    @get
    @route("/{id}")
    get(id: string):
      | {
          /**
           * 正常レスポンス
           */
          @statusCode statusCode: 200;

          @body event: GetLendingEventResponse;
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

  model DebtParmam {
    userId: string;
    amount: uint64;
  }

  model CreateLendingEventRequest {
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
    debts: DebtParmam[];
  }

  model CreateLendingEventResponse {
    id: string;
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
    debts: DebtParmam[];
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }

  model GetLendingEventResponse {
    id: string;
    name: string;
    eventDate: utcDateTime;
    debts: DebtParmam[];
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }
}

model ErrorResponse {
  message: string;
}

