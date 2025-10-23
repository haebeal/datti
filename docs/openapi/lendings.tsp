import "@typespec/http";

using TypeSpec.Http;

namespace DattiApi;

/**
 * 立て替え
 */
@tag("Lendings")
@route("/lendings")
namespace Lending {
  /**
   * 立て替えの作成
   */
  interface Lending {
    @summary("立て替えの作成")
    @post
    create(@body event: CreateRequest):
      | {
          /**
           * 正常レスポンス
           */
          @statusCode statusCode: 201;

          @body newEvent: CreateResponse;
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

    @summary("立て替えの取得")
    @get
    @route("/{id}")
    get(id: string):
      | {
          /**
           * 正常レスポンス
           */
          @statusCode statusCode: 200;

          @body event: GetResponse;
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

    @summary("立て替え一覧の取得")
    @get
    getAll():
      | {
          /**
           * 正常レスポンス
           */
          @statusCode statusCode: 200;

          @body events: GetAllResponse[];
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

  model CreateRequest {
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
    debts: DebtParmam[];
  }

  model CreateResponse {
    id: string;
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
    debts: DebtParmam[];
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }

  model GetResponse {
    id: string;
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
    debts: DebtParmam[];
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }

  model GetAllResponse {
    id: string;
    name: string;
    amount: uint64;
    eventDate: utcDateTime;
  }
}

model ErrorResponse {
  message: string;
}

